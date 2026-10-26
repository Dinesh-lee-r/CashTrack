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
- Day/week/month/year charts and summaries.
- Search, category/date filters and sorting.
- Monthly overall and category budgets.
- Custom categories, multiple currencies and week-start setting.
- 16 theme palettes including Spotify-inspired, white/red, orange/black, purple, cyan and light themes.
- CSV export, JSON backup and merge/replace restore.
- IndexedDB persistence and app-shell service-worker caching.

## Privacy and limitations
Records live in this browser's IndexedDB for this website origin; they are not uploaded. Clearing browser data or storage eviction can remove them. Private browsing may be temporary. Export JSON backups regularly. Data does not sync across devices. External Google Fonts are optional; system fonts work offline. Test airplane mode after the first online load.
