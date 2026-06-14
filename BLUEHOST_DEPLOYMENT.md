# Bluehost deployment guide

This site is a **static** Bengali-cultural-organization site (HTML + JS + CSS + SVG + one MP4). No PHP, no database, no Node runtime. Bluehost's basic shared hosting plan is enough.

## What gets deployed

| File / folder | Purpose |
|---|---|
| `index.html`, `about.html`, `impacts.html`, `events.html`, `sponsors.html`, `join-us.html`, `membership.html`, `event-pass.html`, `volunteer.html`, `sponsorship.html` | 10 site pages |
| `admin.html` | Content manager (OTP login) |
| `404.html` | Friendly "page not found" page |
| `.htaccess` | Apache config: HTTPS, gzip, caching, MIME types, security headers, custom 404 |
| `css/styles.css` | Stylesheet |
| `js/components.js`, `js/content.js` | Shared scripts |
| `images/` | All site imagery: logo, sponsor logos, director photos, hero video, hero SVGs |

## What does NOT get deployed

Skip these — they're for local development only:

```
.claude/             ← Claude Code workspace
.codex/              ← Codex workspace
.agents/             ← Agent workspace files
.git/                ← Git history
docs/                ← Cloned copy for GitHub Pages
reports/             ← Local generated reports
scripts/             ← Local build helpers
test.html            ← Local test page
*.pdf, *.pptx        ← Source design files
BLUEHOST_DEPLOYMENT.md ← (this file)
```

The helper script `scripts/build-bluehost-zip.sh` creates a clean upload ZIP with only production files.

## Step-by-step (using cPanel File Manager)

1. **Log in to Bluehost** → Hosting → cPanel → **File Manager**
2. Open `public_html/` (the document root for your primary domain).
3. If this site replaces an old one, back up the existing files first (download or zip them).
4. **Upload the project as a single ZIP** (much faster than uploading individual files):
  - On your computer, in the project root run:
     ```bash
     ./scripts/build-bluehost-zip.sh
     ```
   - In File Manager → **Upload** → select `dist/baybasi-bluehost.zip`.
   - Back in File Manager, right-click the zip → **Extract** into `public_html/`.
   - Delete the zip after extraction.
5. **Verify file permissions**:
   - Files: `644` (read/write for owner, read for everyone)
   - Directories: `755`
   - cPanel usually sets these automatically.
6. Browse to `https://yourdomain.com/` — you should see the home page.
7. Check that the hero video plays and the navbar dropdown ("Get Involved") works.

## Step-by-step (using FTP / SFTP)

If you prefer an FTP client (FileZilla, Cyberduck):

1. In Bluehost cPanel → **FTP Accounts** → create or reuse an FTP user.
2. Connect FileZilla:
   - Host: `ftp.yourdomain.com` (or `your-server.bluehost.com`)
   - Username: the FTP user from step 1
   - Password: as set
   - Port: 21 (FTP) or 22 (SFTP via SSH if your plan supports it)
3. Navigate to `/public_html/` on the remote side.
4. Upload everything from the project root (excluding the "do NOT deploy" list above).
5. **Make sure `.htaccess` is uploaded** — most FTP clients hide dotfiles by default. In FileZilla: **Server → Force showing hidden files**.

## HTTPS / SSL

Bluehost provisions a free Let's Encrypt cert on every domain automatically. Confirm:

1. cPanel → **SSL/TLS Status** — your domain should show "AutoSSL Status: Active".
2. Visit `https://yourdomain.com/` — if you see a padlock with no warnings, you're done.
3. The `.htaccess` already forces `http://` → `https://`, so visitors who type the wrong scheme get redirected automatically.

Once HTTPS is verified, uncomment the HSTS line near the bottom of `.htaccess`:

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

This tells browsers to **only** ever use HTTPS for your domain.

## Updating the site later

When you change a file locally:

1. Re-upload **only the changed file** via File Manager or FTP (overwriting the old one).
2. If you changed `js/components.js`, also bump the `?v=N` cache buster in every HTML file's `<script src="js/components.js?v=N">` so browsers fetch the new copy. Current pages use `?v=14` and `events.html` uses `?v=15`.
3. If you changed `css/styles.css`, bump `?v=N` in every `<link rel="stylesheet" href="css/styles.css?v=N">`. Currently `?v=7`.

## Admin (`admin.html`) on Bluehost

The Content Manager runs entirely in the browser — it stores image overrides in `localStorage`, so every admin's browser holds its own copy. Nothing is sent to the server.

**One-time setup needed for OTP email delivery:**

1. Sign up at <https://www.emailjs.com> (free up to ~200 emails/month).
2. Add a Gmail service, create an email template that uses `{{to_email}}` and `{{otp}}` placeholders.
3. Open `admin.html`, find this block at the top of the inline `<script>`:
   ```js
   var EMAILJS_CONFIG = {
     publicKey:  'YOUR_PUBLIC_KEY',
     serviceId:  'YOUR_SERVICE_ID',
     templateId: 'YOUR_TEMPLATE_ID',
   };
   ```
4. Replace each placeholder with your EmailJS values, re-upload `admin.html`.
5. Without those values, the page falls back to "dev mode" — the OTP is shown on screen so you can still log in for testing.

Also edit the allowed-admin list near the top of `admin.html`:

```js
var ADMIN_EMAILS = [
  'baybasi@baybasi.us',
  'admin@baybasi.us',
  'santanu@baybasi.us',
];
```

Add or remove emails as needed.

## Performance checklist (already configured in `.htaccess`)

| Optimisation | Status |
|---|---|
| HTTPS forced | ✅ |
| Gzip compression | ✅ for HTML, CSS, JS, JSON, XML, SVG |
| Brotli compression | ✅ if Bluehost has `mod_brotli` (most cPanel installs do) |
| Browser caching | ✅ CSS/JS 1 week, images 1 month, fonts 1 year |
| MIME types for `.mp4`, `.webp`, `.avif`, `.svg`, `.woff2` | ✅ |
| Range requests for video seek | ✅ |
| Security headers (XCTO, XFO, Referrer-Policy, Permissions-Policy) | ✅ |
| Hidden-file protection (`.env`, `.git/`, etc.) | ✅ |
| Directory-listing disabled | ✅ |
| HSTS | ⚠ commented out — enable after confirming HTTPS works |

## Common gotchas

- **`.htaccess` not uploaded** → site works but you don't get HTTPS redirect, gzip, or caching. Make sure your FTP client shows hidden files.
- **Hero video doesn't play on iOS Safari** → ensure the `<video>` tag has `playsinline` (already set in `js/components.js`).
- **Wrong default page** → if `public_html/` already contains an `index.php` or `default.html`, Apache may serve that instead. Delete or rename it.
- **Mixed content warnings** → all external resources (unpkg.com, cdn.tailwindcss.com, cloudfront for the scroll video) are loaded over `https://`, so this shouldn't happen. If it does, check the URL in the HTML.
- **Subdirectory install** (e.g. `yourdomain.com/baybasi/`) → all internal links in the HTML are relative (e.g. `href="about.html"`), and `404.html` now uses relative asset paths too. If the custom Apache 404 should work inside a subdirectory, adjust `ErrorDocument 404 /404.html` in `.htaccess` to the subdirectory path, for example `ErrorDocument 404 /baybasi/404.html`.

## Build a Bluehost ZIP locally

Run:

```bash
./scripts/build-bluehost-zip.sh
```

It writes:

```text
dist/baybasi-bluehost.zip
```

Upload and extract that ZIP into Bluehost `public_html/`.

## Custom domain checklist

If you're pointing a domain you own at Bluehost:

1. cPanel → **Domains → Assign** — add `yourdomain.com`.
2. At your registrar (Namecheap, GoDaddy, etc.), point the nameservers to Bluehost's (`ns1.bluehost.com`, `ns2.bluehost.com`).
3. Wait up to 24 hours for DNS propagation. Most of the time it's done in 30 minutes.
4. cPanel → **SSL/TLS Status** → ensure AutoSSL is provisioned for the new domain.
5. Browse to your domain. Done.

## Need help?

Bluehost's chat support is generally responsive — ask them about:
- Activating `mod_brotli` if it's not enabled (you'll see no Brotli encoding in the Network tab).
- Increasing PHP/upload limits (irrelevant for this static site).
- AutoSSL for additional domains.
