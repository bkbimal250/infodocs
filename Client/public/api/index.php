<?php
// Same-origin bridge for Hostinger PHP hosting. Never accept an upstream URL
// from the browser, and never log request bodies, credentials, or cookies.
declare(strict_types=1);
ini_set('display_errors', '0');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function fail(int $status, string $message): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['detail' => $message]);
    exit;
}

$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH);
if (!is_string($path) || !preg_match('#^/api(?:/|$)#', $path)
    || preg_match('/[\x00-\x1f\x7f\\\\]/', rawurldecode($path))
    || preg_match('#(?:^|/)\.\.?(/|$)#', rawurldecode($path))) {
    fail(400, 'Invalid API path');
}
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], true)) {
    fail(405, 'Method not allowed');
}

// Prevent another website from submitting cookie-authenticated mutations.
if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
    $source = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
    $sourceHost = parse_url($source, PHP_URL_HOST);
    $host = parse_url('https://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST);
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site'
        || !$sourceHost || !$host || strcasecmp($sourceHost, $host) !== 0
        || parse_url($source, PHP_URL_SCHEME) !== 'https') {
        fail(403, 'Request must originate from this website');
    }
}
if (!function_exists('curl_init')) {
    fail(503, 'Enable the PHP curl extension in Hostinger');
}
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'multipart/form-data') === 0 && ini_get('enable_post_data_reading')) {
    fail(503, 'API upload configuration is not active. Check api/.user.ini');
}

$headers = ['Expect:'];
foreach (['CONTENT_TYPE' => 'Content-Type', 'HTTP_ACCEPT' => 'Accept',
          'HTTP_RANGE' => 'Range', 'HTTP_USER_AGENT' => 'User-Agent'] as $key => $name) {
    if (isset($_SERVER[$key])) $headers[] = $name . ': ' . $_SERVER[$key];
}
// Only the API session cookie belongs at the upstream server.
if (isset($_COOKIE['access_token'])) {
    $headers[] = 'Cookie: access_token=' . rawurlencode($_COOKIE['access_token']);
}

$body = tmpfile();
if ($body === false) fail(503, 'Unable to buffer API response');
$responseHeaders = [];
$curl = curl_init('https://infodocs.api.d0s369.co.in' . $uri);
curl_setopt_array($curl, [
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_WRITEFUNCTION => static function ($handle, string $data) use ($body): int {
        return fwrite($body, $data);
    },
    CURLOPT_HEADERFUNCTION => static function ($handle, string $line) use (&$responseHeaders): int {
        if (stripos($line, 'HTTP/') === 0) $responseHeaders = [];
        elseif (strpos($line, ':') !== false) $responseHeaders[] = trim($line);
        return strlen($line);
    },
]);
$input = null;
if (!in_array($method, ['GET', 'HEAD'], true)) {
    $input = fopen('php://input', 'rb');
    curl_setopt($curl, CURLOPT_UPLOAD, true);
    curl_setopt($curl, CURLOPT_INFILE, $input);
    if (isset($_SERVER['CONTENT_LENGTH'])) {
        curl_setopt($curl, CURLOPT_INFILESIZE, (int) $_SERVER['CONTENT_LENGTH']);
    }
}
if ($method === 'HEAD') curl_setopt($curl, CURLOPT_NOBODY, true);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
$ok = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);
if (is_resource($input)) fclose($input);
if ($ok === false || $status < 100) {
    fclose($body);
    fail(502, 'Unable to reach the API. Please try again.');
}
http_response_code($status);
foreach ($responseHeaders as $line) {
    [$name, $value] = explode(':', $line, 2);
    $name = strtolower($name);
    $value = trim($value);
    if ($name === 'set-cookie' && strpos($value, 'access_token=') === 0) {
        // Host-only, first-party cookie. Keep upstream expiry/deletion intact.
        $value = preg_replace('/;\s*(Domain|SameSite)=[^;]*/i', '', $value);
        $value = preg_replace('/;\s*(Secure|HttpOnly)(?=;|$)/i', '', $value);
        header('Set-Cookie: ' . $value . '; Secure; HttpOnly; SameSite=Lax', false);
    } elseif ($name === 'location') {
        $value = preg_replace('#^https://infodocs\.api\.d0s369\.co\.in(?=/api(?:/|\?|$))#', '', $value);
        if (preg_match('#^/api(?:/|\?|$)#', $value)) header('Location: ' . $value);
    } elseif (in_array($name, ['content-type', 'content-disposition', 'content-range', 'accept-ranges'], true)) {
        header($line);
    }
}
rewind($body);
fpassthru($body);
fclose($body);
