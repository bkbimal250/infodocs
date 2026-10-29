// Usage: node scripts/check-hostinger-proxy.cjs /path/to/php-cgi
// Exercises the real PHP bridge with a deterministic, offline cURL transport.
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

const php = process.argv[2];
assert.ok(php, 'Provide the php-cgi executable');
const scratch = mkdtempSync(path.join(tmpdir(), 'infodocs-proxy-check-'));
const fixture = path.join(scratch, 'transport.php');
const bridge = path.resolve(__dirname, '../public/api/index.php');
writeFileSync(fixture, `<?php
$names = ['FOLLOWLOCATION','SSL_VERIFYPEER','SSL_VERIFYHOST','CONNECTTIMEOUT',
'TIMEOUT','HTTPHEADER','WRITEFUNCTION','HEADERFUNCTION','UPLOAD','INFILE',
'INFILESIZE','NOBODY','CUSTOMREQUEST'];
foreach ($names as $index => $name) define('CURLOPT_' . $name, $index + 1);
define('CURLINFO_RESPONSE_CODE', 100);
function curl_init($url) { return (object)['url' => $url, 'options' => []]; }
function curl_setopt_array($c, $options) { $c->options = $options; }
function curl_setopt($c, $key, $value) { $c->options[$key] = $value; }
function curl_close($c) {}
function curl_getinfo($c, $key) { return (int) (getenv('MOCK_STATUS') ?: 200); }
function curl_exec($c) {
    if (getenv('MOCK_FAILURE')) return false;
    $h = $c->options[CURLOPT_HEADERFUNCTION];
    $h($c, 'HTTP/1.1 200 OK');
    $h($c, 'Content-Type: application/json');
    $h($c, 'Cache-Control: public, max-age=3600');
    $h($c, 'Set-Cookie: unrelated=secret');
    if (getenv('MOCK_COOKIE')) $h($c, 'Set-Cookie: ' . getenv('MOCK_COOKIE'));
    if (getenv('MOCK_LOCATION')) $h($c, 'Location: ' . getenv('MOCK_LOCATION'));
    $input = isset($c->options[CURLOPT_INFILE]) ? stream_get_contents($c->options[CURLOPT_INFILE]) : '';
    $body = json_encode(['url' => $c->url, 'headers' => $c->options[CURLOPT_HTTPHEADER],
       'method' => $c->options[CURLOPT_CUSTOMREQUEST], 'body' => $input,
       'verifyPeer' => $c->options[CURLOPT_SSL_VERIFYPEER],
       'followRedirects' => $c->options[CURLOPT_FOLLOWLOCATION]]);
    $c->options[CURLOPT_WRITEFUNCTION]($c, $body);
    return true;
}
`);
function request(overrides = {}, body = '', parseBody = true) {
  const result = spawnSync(php, ['-n', '-d', 'cgi.force_redirect=0', '-d',
    'enable_post_data_reading=0', '-d', `auto_prepend_file=${fixture}`], {
    env: { ...process.env, REDIRECT_STATUS: '200', SCRIPT_FILENAME: bridge,
      REQUEST_METHOD: 'GET', REQUEST_URI: '/api/users/auth/user',
      HTTP_HOST: 'docs.example.com', HTTP_ORIGIN: 'https://docs.example.com',
      CONTENT_LENGTH: String(Buffer.byteLength(body)), ...overrides },
    input: body, encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const [headers, ...chunks] = result.stdout.split(/\r?\n\r?\n/);
  const output = chunks.join('\n\n');
  return { headers, data: parseBody ? JSON.parse(output) : output };
}
try {
  const body = JSON.stringify({ email: 'test@example.com', password: 'test-only' });
  const login = request({ REQUEST_METHOD: 'POST', REQUEST_URI: '/api/users/auth/login_with_email',
    CONTENT_TYPE: 'application/json', MOCK_COOKIE: 'access_token=test-token; Max-Age=3600; Path=/; SameSite=None; Secure; HttpOnly' }, body);
  assert.equal(login.data.body, body);
  assert.equal(login.data.method, 'POST');
  assert.match(login.headers, /Set-Cookie: access_token=test-token; Max-Age=3600; Path=\/; Secure; HttpOnly; SameSite=Lax/i);
  assert.doesNotMatch(login.headers, /unrelated=|Cache-Control: public|Domain=/i);
  assert.match(login.headers, /Cache-Control: no-store/i);
  assert.equal(login.data.verifyPeer, true);
  assert.equal(login.data.followRedirects, false);

  const profile = request({ HTTP_COOKIE: 'access_token=test-token; analytics=private',
    REQUEST_URI: '/api/users/auth/user?search=John%20Smith' });
  assert.ok(profile.data.headers.includes('Cookie: access_token=test-token'));
  assert.ok(!profile.data.headers.some(h => h.includes('analytics')));
  assert.equal(profile.data.url, 'https://infodocs.api.d0s369.co.in/api/users/auth/user?search=John%20Smith');
  const unauthorized = request({ MOCK_STATUS: '401' });
  assert.match(unauthorized.headers, /Status: 401/);
  const logout = request({ REQUEST_METHOD: 'POST', REQUEST_URI: '/api/users/auth/logout',
    MOCK_COOKIE: 'access_token=""; Max-Age=0; Path=/; SameSite=None' });
  assert.match(logout.headers, /Max-Age=0/);
  assert.match(logout.headers, /Secure; HttpOnly; SameSite=Lax/);

  const multipart = '--test\r\nContent-Disposition: form-data; name="file"; filename="a.txt"\r\n\r\nhello\r\n--test--\r\n';
  const upload = request({ REQUEST_METHOD: 'POST', CONTENT_TYPE: 'multipart/form-data; boundary=test' }, multipart);
  assert.equal(upload.data.body, multipart);
  const redirect = request({ MOCK_STATUS: '307', MOCK_LOCATION: 'https://infodocs.api.d0s369.co.in/api/users/' });
  assert.match(redirect.headers, /Location: \/api\/users\//);
  assert.match(request({ REQUEST_METHOD: 'POST', HTTP_ORIGIN: 'https://evil.example' }).headers, /Status: 403/);
  assert.match(request({ REQUEST_URI: '/api/../private' }).headers, /Status: 400/);
  assert.match(request({ REQUEST_URI: '/api/%2e%2e/private' }).headers, /Status: 400/);
  assert.match(request({ REQUEST_URI: '/outside' }).headers, /Status: 400/);
  assert.match(request({ MOCK_FAILURE: '1' }).headers, /Status: 502/);
  console.log('PASS: login body, first-party cookie, profile cookie forwarding, query strings, 401, logout, multipart upload, redirects, CSRF, traversal, upstream failure');
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
