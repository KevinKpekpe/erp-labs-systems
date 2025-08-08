<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\UpdateProfileRequest;
use App\Http\Requests\SuperAdmin\ChangePasswordRequest;
use App\Http\Requests\SuperAdmin\ForgotPasswordRequest;
use App\Http\Requests\SuperAdmin\ResetPasswordRequest;
use App\Models\SuperAdmin;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\SuperAdminPasswordReset;
use Illuminate\Support\Facades\RateLimiter;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request)
    {
        /** @var SuperAdmin $user */
        $user = $request->user();
        if (!$user instanceof SuperAdmin) {
            throw new ApiException('errors.unauthorized', 401, 'UNAUTHENTICATED');
        }

        $data = $request->validated();
        // Construire explicitement le payload depuis l'input (fiable en multipart)
        $payload = [];
        foreach (['name','username','email','telephone','sexe'] as $key) {
            if ($request->has($key)) {
                $payload[$key] = $request->input($key);
            }
        }

        // Uniques: username, email
        if (isset($data['username'])) {
            $exists = SuperAdmin::where('username', $data['username'])->where('id', '!=', $user->id)->exists();
            if ($exists) {
                throw new ApiException('validation.failed', 422, 'USERNAME_TAKEN', [
                    'username' => [__('validation.unique', ['attribute' => 'username'])],
                ]);
            }
        }
        if (isset($data['email'])) {
            $exists = SuperAdmin::where('email', $data['email'])->where('id', '!=', $user->id)->exists();
            if ($exists) {
                throw new ApiException('validation.failed', 422, 'EMAIL_TAKEN', [
                    'email' => [__('validation.unique', ['attribute' => 'email'])],
                ]);
            }
        }

        // Gestion photo de profil
        if (($data['remove_photo'] ?? false) === true) {
            if ($user->photo_de_profil && Storage::disk('public')->exists($user->photo_de_profil)) {
                Storage::disk('public')->delete($user->photo_de_profil);
            }
            $payload['photo_de_profil'] = null;
        } elseif ($request->hasFile('photo_de_profil')) {
            $path = $request->file('photo_de_profil')->store('superadmins', 'public');
            // Supprimer l’ancienne si existe
            if ($user->photo_de_profil && Storage::disk('public')->exists($user->photo_de_profil)) {
                Storage::disk('public')->delete($user->photo_de_profil);
            }
            $payload['photo_de_profil'] = $path;
        }

        // Merge et sauvegarder
        $user->fill($payload)->save();

        return ApiResponse::success($user->fresh(), 'auth.profile_updated');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        /** @var SuperAdmin $user */
        $user = $request->user();
        if (!$user instanceof SuperAdmin) {
            throw new ApiException('errors.unauthorized', 401, 'UNAUTHENTICATED');
        }

        $data = $request->validated();
        if (!Hash::check($data['current_password'], $user->password)) {
            throw new ApiException('validation.failed', 422, 'INVALID_CURRENT_PASSWORD', [
                'current_password' => [__('validation.password')],
            ]);
        }

        $user->update(['password' => Hash::make($data['new_password'])]);

        // Invalider les autres tokens optionnellement
        $user->tokens()->delete();

        return ApiResponse::success(null, 'auth.password_changed');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $email = $request->validated()['email'];

        $super = SuperAdmin::where('email', $email)->first();
        if (!$super) {
            // Ne pas révéler l'existence
            return ApiResponse::success(null, 'auth.reset_link_sent');
        }

        // Générer un OTP 6 chiffres
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        DB::table(config('auth.passwords.users.table', 'password_reset_tokens'))
            ->updateOrInsert(
                ['email' => $email],
                ['token' => $otp, 'created_at' => now()]
            );

        // Envoyer l'email avec l'OTP
        Mail::to($email)->send(new SuperAdminPasswordReset($otp));

        // Ne pas exposer le token en prod
        return ApiResponse::success(null, 'auth.reset_link_sent');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $data = $request->validated();
        $row = DB::table(config('auth.passwords.users.table', 'password_reset_tokens'))
            ->where('email', $data['email'])
            ->first();

        if (!$row || !hash_equals($row->token, $data['otp'])) {
            throw new ApiException('auth.token_invalid', 401, 'TOKEN_INVALID');
        }

        // Vérifier expiration (15 min)
        if (now()->diffInMinutes($row->created_at) > 15) {
            throw new ApiException('auth.token_expired', 401, 'TOKEN_EXPIRED');
        }

        $super = SuperAdmin::where('email', $data['email'])->first();
        if (!$super) {
            throw new ApiException('errors.not_found', 404, 'SUPERADMIN_NOT_FOUND');
        }

        $super->update(['password' => Hash::make($data['new_password'])]);

        // Consommer le token
        DB::table(config('auth.passwords.users.table', 'password_reset_tokens'))
            ->where('email', $data['email'])
            ->delete();

        // Invalider tokens existants
        $super->tokens()->delete();

        return ApiResponse::success(null, 'auth.password_reset_success');
    }

    public function resendOtp(ForgotPasswordRequest $request)
    {
        $email = $request->validated()['email'];
        $key = sprintf('superadmin-otp:%s', sha1($email.'|'.request()->ip()));

        if (RateLimiter::tooManyAttempts($key, 3)) { // 3 tentatives / 15 min
            $seconds = RateLimiter::availableIn($key);
            return ApiResponse::error('errors.too_many_requests', 429, 'RATE_LIMITED', [
                'retry_after_seconds' => [$seconds],
            ]);
        }

        $super = SuperAdmin::where('email', $email)->first();
        // Toujours consommer l'attempt pour éviter enumeration
        RateLimiter::hit($key, 15 * 60);

        if (!$super) {
            return ApiResponse::success(null, 'auth.otp_sent');
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        DB::table(config('auth.passwords.users.table', 'password_reset_tokens'))
            ->updateOrInsert(
                ['email' => $email],
                ['token' => $otp, 'created_at' => now()]
            );

        Mail::to($email)->send(new SuperAdminPasswordReset($otp));

        return ApiResponse::success(null, 'auth.otp_sent');
    }
}


