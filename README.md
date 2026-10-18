# CashTrack (by Dynex)

A mobile-first, offline-first personal expense tracker. The app is a lightweight static PWA with no backend, account, paid API, or third-party runtime dependency.

## Features
- Add/edit/delete expenses, income, transfers, and investments.
- Rule-based offline category suggestions; manual merchant category corrections are remembered locally.
- Daily, weekly, monthly, and yearly reports, trend charts, category breakdowns, and comparisons.
- Search, date/category/payment filters, sorting, and bulk deletion.
- Monthly overall and category budgets with progress warnings.
- IndexedDB persistence, CSV export, JSON backup/merge restore, theme/currency/week-start preferences.
- Installable PWA with a service worker for offline shell caching.

## Run locally
For PWA service-worker support, use a local HTTP server rather than opening `index.html` directly.

With Python 3:
```bash
cd CashTrack
python -m http.server 8080
```
Open `http://localhost:8080` in a browser. This local server is for development/testing only.

## Build/deploy
This is a static app; there is no compilation step. Upload `index.html`, `manifest.webmanifest`, `sw.js`, and the `icons/` directory to any static host that serves HTTPS. Keep the files at the same relative paths. Open the HTTPS URL once while online so the service worker can cache the app shell.

## Install on Android
1. Host the folder on HTTPS.
2. Open the URL in Chrome on Android.
3. Open the ⋮ menu and choose **Install app** or **Add to Home screen**.
4. Launch it from the home screen. After the first successful load, the app shell can open offline.
5. Reopen online periodically to receive updates.

The in-app Install button appears only when the browser exposes the install prompt; otherwise use the browser menu.

## Data and privacy
- Transactions and preferences live in this browser's IndexedDB, on this device/profile. Nothing is uploaded to a server.
- Clearing browser storage, uninstalling/clearing the browser, or device failure may erase the data. Export JSON backups regularly and keep a copy outside the device.
- Import merges by transaction ID: existing IDs are preserved and duplicates are skipped. Imported records are validated before being saved.
- Currency changes affect display formatting only; stored amounts remain in the entered currency's numeric units. Changing currency does not convert historical amounts.
- Percentage change is shown as unavailable if the previous period has zero spending.
- A daily chart groups the selected day into 3-hour blocks.
- Custom categories are not currently editable; the built-in categories are provided. Category budgets can be assigned to the built-in categories.

## Verification notes / known limitations
- Source files were generated for this deliverable, but no Android device or hosted HTTPS environment was available for end-to-end install/airplane-mode testing here.
- The browser-native canvas charts are dependency-free. The app uses IndexedDB, so a current browser is required.
- Opening the HTML with `file://` is not the supported PWA path. Use localhost or HTTPS for persistent storage and service worker behavior.
