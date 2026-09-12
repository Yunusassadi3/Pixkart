# 🚀 PixKart Production Deployment Guide

PixKart is fully configured for zero-downtime deployment on **Netlify**, **Vercel**, or any **Node.js Cloud Server (Railway / Render / VPS)**.

---

## ⚡ Option 1: Deploy to Netlify (Recommended)

PixKart includes pre-configured [`netlify.toml`](file:///d:/PixKart/netlify.toml) with `@netlify/plugin-nextjs`.

### Step 1: Push Code to GitHub / GitLab
```bash
git add .
git commit -m "PixKart production deployment ready"
git push origin main
```

### Step 2: Connect Repository on Netlify
1. Log in to [Netlify.com](https://app.netlify.com/).
2. Click **"Add new site"** → **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node Version**: `20`

### Step 3: Add Environment Variables in Netlify
Go to **Site Settings** → **Environment Variables** and add:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | 24/7 Cloud MySQL Host (or localhost for hybrid) |
| `DB_PORT` | `4000` | Cloud MySQL Port (3306 or 4000) |
| `DB_USER` | `xxxx.root` | Cloud MySQL Username |
| `DB_PASSWORD` | `your_secure_password` | Cloud MySQL Password |
| `DB_NAME` | `pixkart_db` | MySQL Database Name |
| `DB_SSL` | `true` | Required for Cloud MySQL (`true`) |
| `ADMIN_EMAIL` | `pixkartofficial@gmail.com` | Store admin notification email |
| `GMAIL_USER` | `pixkartofficial@gmail.com` | Gmail address for 24/7 order alerts |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` | 16-character Google App Password |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *(Optional)* | Google OAuth Client ID for One-Tap login |

5. Click **"Deploy Site"**! 🎉

---

## ⚡ Option 1B: Netlify Drop / Manual Upload (Deploying the `out` Folder)

If you prefer deploying manually without connecting GitHub:
1. Run the build command on your PC:
   ```bash
   npm run build
   ```
   *This automatically compiles all pages and outputs a fresh, up-to-date static bundle directly into the `D:\PixKart\out` directory.*
2. Open [Netlify Drop](https://app.netlify.com/drop) in your browser.
3. Drag and drop the `D:\PixKart\out` folder into Netlify.
4. Your site is instantly deployed with:
   - **Admin Portal**: Accessible at `/Tanzar` (Passcode: `Tanzar@123`).
   - **`/admin` Route**: Automatically redirects to `/Tanzar`.
   - **Mobile View**: Clean and responsive (the MySQL status & drain frame is strictly hidden on mobile).
   - **Latest Catalog**: All updated products, brands, and categories are bundled.

---

## ⚡ Option 2: Deploy to Vercel

1. Log in to [Vercel.com](https://vercel.com/).
2. Click **"Add New..."** → **"Project"** → Import your GitHub repository.
3. In **Environment Variables**, paste the exact same variables from the table above.
4. Click **"Deploy"**. Next.js App Router and dynamic API routes are configured out-of-the-box.

---

## ☁️ 24/7 Free Cloud Database Setup (₹0 Cost Forever)

To keep your store's database online 24/7 when your local PC is turned off:

1. Create a free account at [TiDB Cloud (Serverless)](https://tidbcloud.com/) or [Aiven](https://aiven.io/).
2. Create a Free MySQL cluster.
3. Download or run [`scripts/init-db.sql`](file:///d:/PixKart/scripts/init-db.sql) in your cloud SQL console to initialize all 13 schema tables.
4. Add the connection credentials into Netlify/Vercel environment variables.

---

## 🔄 Hybrid PC-Shutdown Auto-Sync (If using Local MySQL)

If you run your main database on your local PC:
- While your PC is **OFF**, customer orders, signups, and addresses are automatically captured and held in the cloud queue buffers (`cloud_order_queue` and `cloud_user_queue`).
- When your PC is **ON**, open the Admin Portal at `/admin` or click **"Sync & Drain"** to trigger the **Triple-Handshake Auto-Sync Engine**, which securely commits, verifies, and purges all buffered records into your local MySQL.

---

## 🛡️ Pre-Flight Verification Checklist Passed

- [x] **Next.js 16 App Router**: 0 build errors, 0 TypeScript errors.
- [x] **Dynamic Serverless Routes**: `/api/orders`, `/api/auth/sync`, `/api/products`, `/api/db/health`, `/api/orders/sync-and-drain`, `/api/order-notification`.
- [x] **Clean Routing**: Next.js SSR and SSG routes pre-rendered with CDN delivery.
- [x] **Zero-Data-Loss Architecture**: Triple-Handshake verification engine active.
- [x] **Gmail SMTP Notifications**: Real-time order dispatch verified.
- [x] **Udupi City Geofenced Delivery**: 17+ postal zones validated.
