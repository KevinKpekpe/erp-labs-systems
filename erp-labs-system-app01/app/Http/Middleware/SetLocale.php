<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $supported = config('locale.supported', ['en', 'fr']);
        $fallback = config('app.fallback_locale', 'en');

        $locale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $this->fromAcceptLanguage($request->header('Accept-Language'))
            ?? ($request->hasSession() ? $request->session()->get('locale') : null)
            ?? (Auth::user()?->preferred_locale)
            ?? $fallback;

        $locale = in_array($locale, $supported, true) ? $locale : $fallback;

        app()->setLocale($locale);
        if ($request->hasSession()) {
            $request->session()->put('locale', $locale);
        }

        return $next($request);
    }

    private function fromAcceptLanguage(?string $acceptLanguage): ?string
    {
        if (!$acceptLanguage) {
            return null;
        }
        // Parse simple cases like "fr,fr-FR;q=0.9,en;q=0.8"
        $first = Str::of($acceptLanguage)->before(',')->lower()->value();
        if (!$first) {
            return null;
        }
        $code = Str::of($first)->before('-')->value();
        return $code ?: null;
    }
}


