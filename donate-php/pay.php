<?php
/**
 * Zibal Payment Gateway for Ultimate Downloader
 * Upload this file to: arvangram.ir/donate/pay.php
 */

header('Content-Type: text/html; charset=utf-8');

// Get parameters
$amount = isset($_GET['amount']) ? intval($_GET['amount']) : 0;
$merchant = isset($_GET['merchant']) ? $_GET['merchant'] : '';

// Validate
if ($amount < 1000 || empty($merchant)) {
    die('پارامترهای نامعتبر');
}

// Convert Toman to Rial
$amountRial = $amount * 10;

// Zibal API request
$data = [
    'merchant' => $merchant,
    'amount' => $amountRial,
    'description' => 'حمایت از Ultimate Downloader',
    'callbackUrl' => 'https://arvangram.ir/donate/callback.php'
];

$ch = curl_init('https://gateway.zibal.ir/v1/request');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if ($result && $result['result'] == 100 && isset($result['trackId'])) {
    // Redirect to Zibal payment page
    header('Location: https://gateway.zibal.ir/start/' . $result['trackId']);
    exit;
} else {
    // Error
    $errorMsg = isset($result['message']) ? $result['message'] : 'خطا در اتصال به درگاه پرداخت';
    ?>
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
        <meta charset="UTF-8">
        <title>خطا - Ultimate Downloader</title>
        <style>
            body { font-family: 'Vazirmatn', Tahoma; background: #0A0B14; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .error-box { background: rgba(255,255,255,0.05); padding: 40px; border-radius: 16px; text-align: center; }
            h2 { color: #F87171; }
            a { color: #9597F5; }
        </style>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    </head>
    <body>
        <div class="error-box">
            <h2>خطا در پرداخت</h2>
            <p><?php echo htmlspecialchars($errorMsg); ?></p>
            <p><a href="javascript:window.close()">بستن صفحه</a></p>
        </div>
    </body>
    </html>
    <?php
}
?>
