<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SuperAdminPasswordReset extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $otp)
    {
    }

    public function build()
    {
        return $this->subject(__('Password Reset'))
            ->view('emails.superadmin_password_reset')
            ->with([
                'otp' => $this->otp,
            ]);
    }
}


