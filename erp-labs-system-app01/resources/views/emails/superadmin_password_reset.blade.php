<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{ __('Password Reset') }}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      color: #111;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      background-image:
        url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,0 60,15 60,37 30,52 0,37 0,15' fill='%23e5e7eb' fill-opacity='0.5'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-position: top;
    }
    .header {
      background-color: #f97316; /* orange style facture */
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content {
      padding: 20px 30px;
      font-size: 14px;
      line-height: 1.5;
      color: #374151;
      background-color: rgba(255, 255, 255, 0.9);
    }
    .otp-box {
      margin: 20px 0;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      color: #111827;
    }
    .footer {
      padding: 15px 20px;
      font-size: 12px;
      text-align: center;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      background-color: rgba(255,255,255,0.9);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header style facture -->
    <div class="header">
      {{ __('PASSWORD RESET') }}
    </div>

    <!-- Contenu -->
    <div class="content">
      <p>{{ __('You requested a password reset.') }}</p>
      <p>{{ __('Use this OTP to reset your password:') }}</p>

      <!-- OTP dans un encadré style tableau facture -->
      <div class="otp-box">
        {{ $otp }}
      </div>

      <p>{{ __('This code expires in 15 minutes.') }}</p>
    </div>

    <!-- Footer style facture -->
    <div class="footer">
      © {{ date('Y') }} {{ config('app.name') }} — {{ __('All rights reserved.') }}
    </div>
  </div>
</body>
</html>
