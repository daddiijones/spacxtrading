# Deploying to Namecheap cPanel Shared Hosting

Steps to get this Vite + Express + Prisma app running on Namecheap shared hosting (cPanel, Passenger/`nodevenv`, MySQL). Adapted from the [westernapex](https://github.com/daddiijones/westernapex) deployment on the same hosting account — see that project's `DEPLOYMENT.md` for the original Next.js-specific version of this playbook.

Unlike a Next.js app, this project has two halves that both need to end up served by **one** Node process in production:
- `server/` — the Express API + Socket.io (already a plain Node entry point, no Passenger wrapper needed)
- `src/` — the Vite/React frontend, built to `dist/` and served as static files + an SPA fallback by the same Express app (see `server/index.js`)

## 1. Prep the repo locally

- `.gitignore` excludes secrets and build artifacts: `.env*`, `/node_modules`, `/dist`, `/server/uploads`.
- `prisma/schema.prisma` is already set to `provider = "mysql"` (Namecheap shared hosting only offers MySQL via phpMyAdmin — there's no Postgres on this plan).
- The frontend's API/socket URLs (`src/utils/api.js`, `src/components/LiveChatWidget.jsx`, `src/layouts/AdminLayout.jsx`, `src/pages/admin/LiveChat.jsx`) switch automatically between `http://localhost:5002` in dev and same-origin relative paths in a production build (`import.meta.env.DEV` check) — nothing to configure here.

## 2. Push to GitHub

```bash
git init
git add -A
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:daddiijones/spacxtrading.git
git push -u origin main
```

## 3. Create the Node.js App in cPanel

**cPanel → Setup Node.js App → Create Application**

| Field | Value |
|---|---|
| Node.js version | Highest available (≥18.x; match whatever you used for westernapex if possible, e.g. ≥20.9.0) |
| Application mode | Production |
| Application root | `spacxtrading` |
| Application URL | `spacxtrading.online` |
| Application startup file | `server/index.js` |
| Environment variables | added in step 6 below, or via `.env` |

cPanel auto-creates the app root directory with placeholder files and a Node virtual environment (`nodevenv`) — **don't delete `tmp/`**, Passenger uses it for restart signaling.

## 4. Get a terminal into the app's environment

cPanel's "Setup Node.js App" page gives you an activation command — run it every time you open a new terminal session, it doesn't persist:

```bash
source /home/<user>/nodevenv/spacxtrading/<node-version>/bin/activate && cd /home/<user>/spacxtrading
which node && node -v   # sanity check the venv is actually active
```

## 5. Get the real repo into the app root

The app root already has cPanel's placeholder files, so a plain `git clone` into it fails ("directory not empty"). Move the conflicting files out of the way, then init + pull instead of clone:

```bash
mkdir -p server && mv server/index.js server/index.js.bak 2>/dev/null
git init
git remote add origin https://github.com/daddiijones/spacxtrading.git   # HTTPS is fine if the repo is public
git pull origin main
git branch -M main
git branch --set-upstream-to=origin/main main   # so future updates are just `git pull`
rm -f server/index.js.bak
```

(If the repo is private, you'll need a GitHub Personal Access Token in the clone URL instead, or use cPanel's own Git Version Control tool, which manages its own deploy key.)

## 6. Create `.env` on the server

```bash
cat > /home/<user>/spacxtrading/.env << 'EOF'
DATABASE_URL="mysql://<db_user>:<url_encoded_password>@localhost:3306/<db_name>"
JWT_SECRET=<pick-a-long-random-string>
WALLET_ENCRYPTION_SECRET=<pick-a-different-long-random-string>
SMTP_HOST=mail.<yourdomain>
SMTP_PORT=465
SMTP_USER=support@<yourdomain>
SMTP_PASS=<password>
EMAIL_FROM=support@<yourdomain>
ADMIN_EMAIL="admin@<yourdomain>"
EOF
```

Real values for this account are in your password manager / the credentials you already have from cPanel — never commit them to this file or to git. (See the project's local memory notes for where they're recorded, if you've saved them there.)

**Gotcha:** any special character in the DB password (`@`, `:`, `/`, etc.) must be percent-encoded in the connection string or the URL parser misreads where the password ends.

**Gotcha:** `localhost` in `DATABASE_URL` only resolves correctly *on the server itself* — confirmed by testing: connecting to the shared IP's port 3306 from outside times out (Remote MySQL is not enabled). All DB setup (`prisma db push`, seeding) has to happen from this SSH session, not from your local machine.

**Gotcha (already fixed in code, but worth knowing):** this mail server's TLS certificate is a shared-hosting wildcard (`*.web-hosting.com`), not one matching `mail.westernapex.online`/`spacxtrading.online`. Strict hostname verification fails even though the login/send itself works — `server/services/emailService.js` sets `tls: { rejectUnauthorized: false }` to work around it (same fix westernapex's `lib/email.js` uses). Verified live: a real test email sent through this exact SMTP config delivered successfully.

## 7. Install, generate, push schema, seed

```bash
npm install
npx prisma generate
npx prisma db push      # creates tables in the MySQL database
npm run seed             # admin account + the 6 SpaceX-fleet investment plans
```

Admin login after seeding: `admin@spacxtrading.online` with the password set in `server/seed.js` — log in once, then change it from the admin settings page immediately (don't leave the seeded default in place on a live site).

## 8. Build

```bash
npm run build
```

Two shared-hosting-specific failures to watch for (hit on westernapex, may or may not apply here since Vite's esbuild/Rollup pipeline is lighter than Next's webpack/SWC, but worth knowing the shape of the problem):

- **`EAGAIN` on spawn.** Shared hosting (CloudLinux) caps how many OS processes your account can run at once. If `vite build` fails this way, build locally instead (`npm run build` on your own machine) and upload the resulting `dist/` folder via File Manager or `scp`/`rsync`, then skip this step on the server.
- **Symlinked `node_modules` confusing a bundler.** cPanel's `nodevenv` makes your app's `node_modules` a symlink into the venv's own lib directory. We haven't hit this with Vite/Rollup, but if a build step complains about symlinks resolving outside the project root, that's the class of issue — same root cause as the Turbopack problem westernapex hit, different bundler.

## 9. Restart and verify

cPanel → Setup Node.js App → your app → **Restart**.

Then check:
- `https://spacxtrading.online/` loads the landing page (not 503/blank)
- `https://spacxtrading.online/api/health` returns `{"status":"ok"}`
- Admin login works end-to-end (including the OTP email actually arriving)
- A deposit/withdrawal/mining-plan page renders real data from MySQL
- Live chat connects (Socket.io over the same origin, no mixed-content/CORS errors in the browser console)

## Redeploying after future changes

```bash
git pull
npm install              # only if package.json changed
npx prisma generate      # only if schema.prisma changed
npx prisma db push        # only if schema.prisma changed
npm run build
```
Then restart the app from the cPanel UI.
