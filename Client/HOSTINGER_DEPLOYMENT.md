# Hostinger login fix

The website and API use unrelated domains. Browsers can block the API's
third-party session cookie even with SameSite=None and withCredentials=true.
The frontend now calls `/api` on its own domain. A PHP bridge forwards requests
to the fixed HTTPS API upstream and sets a host-only Secure, HttpOnly,
SameSite=Lax cookie on the website. Passwords/tokens are not stored in JavaScript.

## Upload

1. Run `npm run build` inside `Client`.
2. Back up the existing website files and `.htaccess` in Hostinger File Manager.
3. Upload the **contents** of `Client/dist` into the site's `public_html` directory.
   Include the hidden `.htaccess` file and the complete `api` directory, including
   `api/.user.ini`. Merge any custom rules in the old `.htaccess`; the `/api` rule
   must precede the React fallback. Do not upload source code, backend `.env`,
   Python files, or `node_modules`.
4. In hPanel, use PHP 8.2 or newer with the `curl` extension enabled. Enable HTTPS
   and force HTTPS for the website. The upstream API must also remain HTTPS.
5. Wait up to five minutes for PHP `.user.ini` settings to refresh. This file
   disables automatic form parsing only for the bridge, preserving multipart
   uploads byte-for-byte. If uploads report configuration inactive, set
   `enable_post_data_reading=Off` for this API directory through hosting support.
6. Exclude `/api/*` from Hostinger/CDN caching and purge the old frontend cache.
   The bridge also returns `Cache-Control: no-store` for every response.
7. Reload and sign in again; old cookies on the API domain do not migrate.

No backend code or database migration is required. API requests always use `/api`,
even if an older `.env` still has an absolute `VITE_API_BASE_URL`.
The Vite development server proxies `/api` itself; production requires PHP hosting.
Vite preview and static-only hosting do not execute the PHP bridge.

## Verify after deployment

- Before login, `/api/users/auth/user` should return JSON with 401, not React HTML.
- Test password, email OTP, and phone OTP login; the next `/api/users/auth/user`
  request should return 200. Both URLs must use the website's domain.
- Refresh a protected page and confirm the session persists.
- Verify in Safari/iPhone, Android Chrome, Firefox, and a browser with third-party
  cookies blocked. Ordinary first-party cookies must still be enabled.
- Sign in on two devices; sign out on one and verify the other remains signed in.
- Sign out, then reopen a protected page. The website cookie should be deleted
  and the profile endpoint should return 401.
- Test a document upload, PDF download, and a search containing spaces.

If `/api` returns HTML, check `.htaccess`. A 502 means Hostinger could not reach
the upstream API (check outbound HTTPS access, DNS, certificates, and API health).
An upload configuration 503 means `.user.ini` has not taken effect. Hostinger's
request-size and execution-time limits still apply to uploads/PDF generation.

This is prepared locally; actual Hostinger routing and real-device sign-in must
be verified after upload. It does not guarantee login when all cookies are disabled.

References: [MDN third-party cookies](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies),
[Hostinger .htaccess](https://support.hostinger.com/en/articles/1583307-how-to-create-an-htaccess-file).
