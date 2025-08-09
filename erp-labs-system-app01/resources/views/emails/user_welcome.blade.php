<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{ __('Welcome to ERP Labs System') }}</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;color:#111}</style>
</head>
<body>
  <h2>{{ __('Welcome!') }}</h2>
  <p>{{ __('Your account has been created.') }}</p>
  <ul>
    <li>{{ __('Company name') }}: <strong>{{ $company->nom_company }}</strong></li>
    <li>{{ __('Company code') }}: <strong>{{ $company->code }}</strong></li>
    <li>{{ __('Username') }}: <strong>{{ $username }}</strong></li>
    <li>{{ __('Email') }}: <strong>{{ $email }}</strong></li>
    <li>{{ __('Temporary password') }}: <strong>{{ $temporaryPassword }}</strong></li>
  </ul>
  <p>{{ __('Use your company code + username/email to login and change your password at first login.') }}</p>
</body>
</html>


