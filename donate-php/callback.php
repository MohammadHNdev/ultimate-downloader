<?php
/**
 * Zibal Payment Callback for Ultimate Downloader
 * Upload this file to: arvangram.ir/donate/callback.php
 */

header('Content-Type: text/html; charset=utf-8');

$trackId = isset($_GET['trackId']) ? $_GET['trackId'] : '';
$success = isset($_GET['success']) ? $_GET['success'] : '0';
$status = isset($_GET['status']) ? $_GET['status'] : '';

// Merchant code
$merchant = '688e17eaa45c720010f6b731';

// Verify payment with Zibal
$verified = false;
$amount = 0;

if ($trackId && $success == '1') {
    $data = [
        'merchant' => $merchant,
        'trackId' => $trackId
    ];

    $ch = curl_init('https://gateway.zibal.ir/v1/verify');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($result && $result['result'] == 100) {
        $verified = true;
        $amount = isset($result['amount']) ? $result['amount'] / 10 : 0; // Convert to Toman
    }
}
?>
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $verified ? 'پرداخت موفق' : 'پرداخت ناموفق'; ?> - Ultimate Downloader</title>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            background: linear-gradient(135deg, #0A0B14 0%, #1a1b2e 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            max-width: 450px;
            width: 100%;
        }
        .icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 36px;
        }
        .icon.success { background: linear-gradient(135deg, #22C55E, #16A34A); }
        .icon.error { background: linear-gradient(135deg, #EF4444, #DC2626); }
        h1 { font-size: 24px; margin-bottom: 16px; font-weight: 600; }
        .success h1 { color: #4ADE80; }
        .error h1 { color: #F87171; }
        p { color: rgba(255,255,255,0.7); line-height: 1.8; margin-bottom: 24px; }
        .amount { font-size: 28px; font-weight: 700; color: #9597F5; margin: 16px 0; }
        .btn {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%);
            color: #fff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 30px rgba(255, 107, 157, 0.3);
        }
        .track-id { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container <?php echo $verified ? 'success' : 'error'; ?>">
        <div class="icon <?php echo $verified ? 'success' : 'error'; ?>">
            <?php echo $verified ? '✓' : '✗'; ?>
        </div>

        <?php if ($verified): ?>
            <h1>پرداخت موفق بود!</h1>
            <p>از حمایت شما سپاسگزاریم. کمک شما به توسعه و بهبود نرم‌افزار کمک می‌کند.</p>
            <div class="amount"><?php echo number_format($amount); ?> تومان</div>
        <?php else: ?>
            <h1>پرداخت ناموفق</h1>
            <p>متأسفانه پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید.</p>
        <?php endif; ?>

        <a href="javascript:window.close()" class="btn">بستن صفحه</a>

        <?php if ($trackId): ?>
            <p class="track-id">کد پیگیری: <?php echo htmlspecialchars($trackId); ?></p>
        <?php endif; ?>
    </div>
</body>
</html>
