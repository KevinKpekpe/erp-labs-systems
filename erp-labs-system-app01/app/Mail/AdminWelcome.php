<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Company $company,
        public string $username,
        public string $email,
        public string $temporaryPassword
    ) {}

    public function build()
    {
        return $this->subject(__('Welcome to ERP Labs System'))
            ->view('emails.admin_welcome')
            ->with([
                'company' => $this->company,
                'username' => $this->username,
                'email' => $this->email,
                'temporaryPassword' => $this->temporaryPassword,
            ]);
    }
}


