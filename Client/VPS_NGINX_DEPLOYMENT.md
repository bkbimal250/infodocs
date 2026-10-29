# VPS deployment: Nginx and FastAPI

The production frontend calls the same-origin `/api` path. Nginx must proxy
that path to the existing FastAPI application; it must not send API requests
through the SPA fallback. The frontend is static and does not provide an API
runtime by itself.

## Nginx HTTPS server block

Merge the following into the existing HTTPS server block for
`docs.dishaonlinesolution.in`. Keep the existing `listen`, `server_name`,
Certbot certificate directives, and unrelated site configuration. The
repository's `.env.example` currently specifies port `8009`, but the live
listener must be confirmed before using that port. Preserve the `/api` prefix
by using `proxy_pass` without a URI suffix.

```nginx
root /var/www/infodocs/Client/dist;

location = /api {
    proxy_pass http://127.0.0.1:8009;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 10s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
    client_max_body_size 500m;
}

location ^~ /api/ {
    proxy_pass http://127.0.0.1:8009;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 10s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
    client_max_body_size 500m;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Do not add permissive CORS headers:
the frontend and API are same-origin when served this way. Do not configure
`limit_except`; FastAPI defines which HTTP methods each route accepts.

## Verify the VPS before applying

The checked-in configuration does not identify the currently running systemd
unit or listening port. On the VPS, inspect those first and use the listener
actually owned by the FastAPI process:

```sh
sudo ss -ltnp
systemctl list-units --type=service --all | grep -Ei 'infodocs|fastapi|uvicorn|gunicorn'
```

If the backend is not already managed by a persistent service, configure one
for the existing `fastapi-backend/main.py` application using the existing
Python environment and `.env` on the VPS. Do not replace the database or
change its schema. Restrict a new local upstream to loopback unless another
known integration requires a public listener. Do not copy `.env` into the
frontend or source control.

After merging the locations into the existing virtual host:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

Check the service and Nginx logs without printing environment variables or
request bodies:

```sh
sudo systemctl status <actual-backend-service>
sudo journalctl -u <actual-backend-service> --since '15 minutes ago' --no-pager
sudo tail -n 100 /var/log/nginx/error.log
```

Verify `/api/users/auth/user` returns the backend's JSON authentication
response rather than the SPA HTML, verify `/api/users/auth/login_with_email`
with valid and invalid test accounts, and load a frontend deep link. Never put
real credentials in shell history or deployment logs.

The repository's `public/.htaccess` is not used by Nginx. It keeps Apache from
rewriting API paths to the SPA, but it does not proxy API traffic.
