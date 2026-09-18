# Orange Refrigeration — Service Booking App

Bilingual (English + Telugu) service booking app for **Orange Refrigeration** (Proprietor: Manikanta), Sullurupeta. Customers can request AC / Refrigerator / Washing Machine repairs and pick a date + time slot. The owner uses a password-protected admin page to view and manage bookings.

Built with React + Vite. Ships as an installable **PWA** and can be packaged into a real **Android APK** with Capacitor.

---

## Features

- 🍊 Branded home screen: services, brands, tap-to-call, map directions
- 🛠️ Booking form: name, phone, address, appliance, problem, preferred date & time slot
- 🌐 Language toggle: English ⇄ తెలుగు (whole app)
- 📲 Optional WhatsApp send of each booking to the owner
- 🔒 Admin page: view all bookings, filter by status, update status (Pending / Confirmed / Completed / Cancelled), call customer, delete
- 📱 Installs like a native app (PWA) and exportable to APK

---

## Run locally (web / PWA)

```bash
npm install
npm run dev
```

Open the printed URL (http://localhost:5173). On a phone browser you can "Add to Home Screen" to install it like an app.

Build for production:

```bash
npm run build      # output in dist/
npm run preview    # preview the production build
```

---

## Configuration

Edit `src/config.js`:

- `SHOP.phones` — shop phone numbers (⚠️ **verify these against the card**)
- `SHOP.whatsapp` — owner WhatsApp number in intl format, no `+` (e.g. `917287821424`)
- `SHOP.address`, `SHOP.mapsQuery` — address + Google Maps search text
- `ADMIN_PASSWORD` — **change this before sharing the app** (currently `orange@123`)
- `TIME_SLOTS` — available booking time slots

---

## Build a real APK

The project is pre-wired with Capacitor. You need the **Android SDK** (via Android Studio) installed once.

```bash
# 1. Build the web app + add the Android platform (first time only)
npm run build
npm run cap:add:android

# 2. Sync web build into the native project
npm run cap:sync

# 3a. Open in Android Studio to build/run
npm run cap:open:android

# 3b. OR build a debug APK from the command line
npm run apk:build
```

The debug APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

Install it on a phone by copying the file over and opening it (enable "install from unknown sources").

### No Android SDK? Build the APK in the cloud
1. Run `npm run build`.
2. Go to https://www.pwabuilder.com, enter your deployed site URL, and download an Android package. This uses the PWA manifest already configured here.

---

## Important note on data storage

Bookings are currently stored in the **browser/device localStorage**. This means a booking made on a customer's phone is **not** automatically visible on the owner's admin phone — they are separate devices.

For real cross-device sync, connect a free backend. The only file to change is `src/store.js` (swap the localStorage read/write for API calls). Recommended options:

- **Supabase** (Postgres + REST, generous free tier)
- **Firebase Firestore**

Until then, the built-in **"Send on WhatsApp"** option is the practical way the owner receives each booking instantly.
```
```
