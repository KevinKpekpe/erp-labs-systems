<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{ __('Password Reset') }}</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;color:#111}</style>
</head>
<body>
  <p>{{ __('Use this OTP to reset your password:') }} <strong>{{ $otp }}</strong></p>
  <p>{{ __('This code expires in 15 minutes.') }}</p>
</body>
</html>


