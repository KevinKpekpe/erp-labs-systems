<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{ __('Welcome to ERP Labs System') }}</title>
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
      position: relative;
    }
    /* Bandeaux hexagonaux haut et bas */
    .hex-top, .hex-bottom {
      width: 100%;
      height: 60px;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,0 60,15 60,37 30,52 0,37 0,15' fill='%23e5e7eb' fill-opacity='0.5'/%3E%3C/svg%3E");
      background-repeat: repeat-x;
    }
    .hex-top {
      position: absolute;
      top: 0;
      left: 0;
    }
    .hex-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
    }
    .header {
      background-color: #f97316; /* orange style facture */
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 1px;
      position: relative;
      z-index: 2;
    }
    .content {
      padding: 20px 30px;
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
      position: relative;
      z-index: 2;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }
    ul li {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
    }
    ul li strong {
      color: #111827;
    }
    .footer {
      padding: 15px 20px;
      font-size: 12px;
      text-align: center;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      position: relative;
      z-index: 2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hex-top"></div>

    <!-- Header style facture -->
    <div class="header">
      {{ __('WELCOME TO ERP LABS SYSTEM') }}
    </div>

    <!-- Contenu -->
    <div class="content">
      <h3>{{ __('Welcome!') }}</h3>
      <p>{{ __('Your company has been created.') }}</p>
      <ul>
        <li>{{ __('Company name') }}: <strong>{{ $company->nom_company }}</strong></li>
        <li>{{ __('Company code') }}: <strong>{{ $company->code }}</strong></li>
        <li>{{ __('Admin username') }}: <strong>{{ $username }}</strong></li>
        <li>{{ __('Admin email') }}: <strong>{{ $email }}</strong></li>
        <li>{{ __('Temporary password') }}: <strong>{{ $temporaryPassword }}</strong></li>
      </ul>
      <p>{{ __('Please login with your company code, username/email and change your password at first login.') }}</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      © {{ date('Y') }} {{ config('app.name') }} — {{ __('All rights reserved.') }}
    </div>

    <div class="hex-bottom"></div>
  </div>
</body>
</html>
