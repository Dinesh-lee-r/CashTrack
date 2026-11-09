# CashTrack — by Dynex

A lightweight static PWA for tracking expenses locally. No login, backend, or cloud sync.

## Run locally
Use a local web server because service workers do not work from `file://`:
```bash
python -m http.server 8080
```
Open `http://localhost:8080`.

## Publish on GitHub Pages
1. Create a repository named `CashTrack`.
2. Upload the contents of this folder to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/(root)`, then Save.
5. Wait for the HTTPS URL, e.g. `https://YOUR-USERNAME.github.io/CashTrack/`.

## Install on Android Chrome
Open the HTTPS URL in Chrome, load it online once, then use **⋮ → Install app** or **Add to Home screen**. The Install button can invoke Chrome's prompt when available; Chrome controls install eligibility. If it does not appear, verify HTTPS, the manifest, service worker, and successful first load. Browser menus vary.

## Features
- Expense, income, transfer and investment entries; edit and delete.
- Offline keyword categorisation with manual correction memory.
- Date-selected daily totals, top spending category, and compact category/date charts for day, week, month and year.
- Statistics pie chart with category drill-down.
- Borrowing and lending ledger with partial repayments and settlement tracking.
- EMI plans with tenure, due dates, monthly paid status and notification checks when the app is opened.
- Search, category/date filters and sorting.
- Monthly overall and category budgets.
- Custom categories, multiple currencies and week-start setting.
- 16 theme palettes including Spotify-inspired, white/red, orange/black, purple, cyan and light themes.
- CSV export, JSON backup and merge/replace restore.
- IndexedDB persistence and app-shell service-worker caching.

## Privacy and limitations
Records live in this browser's IndexedDB for this website origin; they are not uploaded. Clearing browser data or storage eviction can remove them. Private browsing may be temporary. Export JSON backups regularly. Data does not sync across devices. External Google Fonts are optional; system fonts work offline. Test airplane mode after the first online load.
\n\n## Reminder limitation\nEMI reminders use browser notifications and are checked when the app is opened. Reliable scheduled notifications while the app is fully closed require native Android scheduling or a push-notification backend; this static PWA does not guarantee background delivery.\n

## v9 mobile chart correction
- Chart drawing now measures the canvas's actual CSS width, not the card width minus a guessed padding.
- Canvas backing-store pixels are separated from its CSS layout dimensions.
- Removed full-page redraws on every mobile viewport resize; chart redraws only when its container width changes.
- Service worker cache updated to v9 and app code is refreshed network-first with offline fallback.


## Final PWA install/cache correction (v10)
- Service-worker precache contains only files included in this package.
- The icon link and manifest point to the included PNG app icons.
- Service-worker cache version is v10.
- HTML references versioned CSS and JavaScript assets to reduce stale-file issues.
- Updating these files does not intentionally clear IndexedDB transaction data.


## v11 chart improvements
- Added a category color legend under the home spending chart, including each category's total for the selected period.
- Category colors are stable across day, week, month and year views.
- Monthly chart labels are spaced at five-day intervals to prevent dates 29 and 30 from overlapping; every date's bar remains visible.
- Rebuilt the 192px and 512px PNG icons from the supplied icon.svg so the manifest and service-worker icon paths exist in this package.
- Service-worker cache updated to v11.
