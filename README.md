# Abdulrehman Qureshi — Portfolio

Dark-luxury portfolio (Next.js 14 · TypeScript · Tailwind CSS · Three.js · Framer Motion) with a built-in admin CMS at `/admin` for editing all site content and hiding/showing sections.

---

## 1. Local Setup

### Prerequisites
- **Node.js 18.17+** (check with `node -v`)
- npm (comes with Node)

### Install & Run

```bash
cd Portfolio-main
npm install        # restores node_modules from package-lock.json
npm run dev        # dev server with hot reload
```

Open **http://localhost:3000**

- Portfolio: `/`
- Admin CMS: `/admin` — enter your master passkey (stored in `data/admin-config.json` or configure via `ADMIN_PASSWORD` env var; update anytime under **Security & Settings** in the admin)

If port 3000 is taken: `npm run dev -- -p 3001`

### Other scripts

```bash
npm run build      # production build (.next)
npm start          # serve the production build
npx tsc --noEmit   # typecheck only
```

### Editing content

Two ways — both write to the same file (`data/portfolio-content.json`):

1. **Admin UI (recommended):** log in at `/admin` → edit text, projects, experience,
   certifications → toggle sections on/off in the **Sections** tab → **Save Changes**.
2. **Manually:** edit `data/portfolio-content.json` and restart the dev server.

> Note: hiding a section in the admin also removes its navbar link automatically.

---

## 2. Production Build (any host)

```bash
npm install
npm run build
npm start          # serves on $PORT or 3000
```

Verify before deploying: build finishes with 0 errors and `npm start` serves the site.

---

## 3. Deploy to Vercel (recommended)

Vercel is made by the Next.js team — zero config needed.

**Option A — Git (recommended, gives you CI on every push):**
1. Push this folder to a GitHub repo (`.gitignore` already excludes
   `node_modules/`, `.next/`, logs, and `.env*.local`).
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js** (auto-detected). Build command `npm run build`,
   output handled by Vercel — leave defaults.
4. Click **Deploy**. Every future `git push` auto-deploys.

**Option B — CLI:**
```bash
npm i -g vercel
vercel          # from this folder; follow the prompts
vercel --prod   # subsequent production deploys
```

> **CMS persistence on Vercel:** the admin writes to `data/portfolio-content.json`
> on disk. Vercel's serverless filesystem is **read-only at runtime**, so admin
> edits don't persist between requests/deploys there. The site itself works
> perfectly (it reads the committed JSON). If you need admin edits to stick on
> Vercel, move storage to a database or a headless CMS. For a writable-disk host
> see Railway/Render/VPS below.

---

## 4. Deploy to Netlify

1. Push to GitHub, then [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Netlify detects Next.js via its official runtime. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (the Next Runtime handles the rest)
3. Ensure the **Next Runtime plugin** is enabled (it is by default on new sites).
4. Deploy.

Or with the CLI:
```bash
npm i -g netlify-cli
netlify init     # link/create site
netlify deploy --build --prod
```

> Same persistence caveat as Vercel: serverless = read-only runtime filesystem.

---

## 5. Hosts with a writable disk (full CMS persistence)

If you want `/admin` saves to persist on the server, deploy to a long-running
Node host instead:

| Host | How |
|---|---|
| **Railway** | New project → Deploy from GitHub → it detects Next.js → add a `start` script run. Disk persists per deployment. |
| **Render** | New **Web Service** → build `npm install && npm run build` → start `npm start`. |
| **VPS (any)** | `npm install && npm run build && pm2 start "npm start"` behind nginx/Caddy. |

All three: set the start command to `npm start`, and the admin CMS will write
`data/portfolio-content.json` to the container disk as designed.

---

## 6. Environment & Security Notes

- No environment variables are required to run. All content lives in
  `data/portfolio-content.json`.
- The admin password is stored securely in `data/admin-config.json`. **You can update it anytime** via
  `/admin` → Security & Settings.
- Optional hardening for production: set the password via the environment variable
  (`ADMIN_PASSWORD`), which `lib/contentStore.ts` automatically honors.

---

## 7. Project Structure

```
app/            # Routes: /, /admin, API (content, auth), layout, global styles, icon
components/     # 12 UI components (hero, 3D sculpture, sections, navbar, footer)
lib/            # contentStore (read/write JSON + admin auth), data (defaults)
data/           # portfolio-content.json (all site content), admin-config.json
types/          # Shared TypeScript types
public/assets/  # Project images, certificates, resume.pdf
```

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `npm run build` works, dev server shows stale page | Delete `.next/` and restart `npm run dev` |
| Port already in use | `npm run dev -- -p 3001` |
| Admin save says "Check your admin password" | Password changed in `data/admin-config.json` or via the admin UI |
| Type errors on fresh clone | Ensure Node 18.17+; run `npx tsc --noEmit` to see details |
| Desktop looks too large/small | Global density is `html { zoom: 0.8 }` for ≥1024px in `app/globals.css` — adjust the 0.8 |

## 9. Connect

- GitHub: [@crazy-scientistt](https://github.com/crazy-scientistt)
- LinkedIn: [Abdulrehman Qureshi](https://www.linkedin.com/in/abdulrehman-ai/)
- Email: abdulrehmanqureshi2002@gmail.com
