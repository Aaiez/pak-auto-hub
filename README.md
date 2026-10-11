# PakAutoHub — Installable Phone App

A responsive Pakistan car catalogue and installable Progressive Web App (PWA) for Android and iPhone. Project by Aaiez Arshad.

Live app: https://pakautohub-aaiez.sagetoad8.chatgpt.site

## Install on a phone

**Android:** Open the live URL in Chrome. Tap **Install app** and confirm. If the browser prompt is unavailable, open Chrome’s menu and choose **Install app** or **Add to Home screen**.

**iPhone:** Open the live URL in Safari. Choose **Share → Add to Home Screen**. Enable **Open as Web App** when shown, then tap **Add**. Launch the new PakAutoHub icon and open it once online to prepare its offline copy.

The website also includes an installation guide with Android and iPhone steps. Install from the live HTTPS URL, not by opening an HTML file from this ZIP. This package is web-app source; it is not a signed APK/IPA or a Play Store/App Store release.

## Features

- 19 model-year entries: nine new cars and ten used cars; 31 variant/price records.
- Toyota, Honda, Suzuki and Hyundai company tabs.
- Search, body type, condition, model year, purchase budget and price/name sorting.
- Browser/app-local saved favourites.
- Compare up to three cars, including the 30-lakh new/used comparison.
- Editable fees, used-car repair reserve, seller quotes, fuel and maintenance planning.
- Phone bottom navigation: Cars, Budget, Saved and Compare.
- Android icons, Android maskable icon, Apple touch icon and standalone app window.
- Device-local budget/priority/allowance settings across launches.
- Offline app code, catalogue, local icons and available local car photographs.
- A Refresh action when a new app version is ready.

## Every technology and source file

| Technology | File(s) | Purpose |
|---|---|---|
| HTML | index.html | Page, forms, phone navigation, install dialog and comparison containers |
| CSS | style.css | Existing catalogue design and responsive car layouts |
| CSS | pwa.css | Phone app layout, safe areas, touch targets, installation UI and bottom navigation |
| JavaScript | app.js | Car cards, company tabs, search/filtering, saved cars, details, comparison and navigation state |
| JavaScript | core.js | Budget, price, upfront cost, fuel and shortlist calculations |
| JavaScript | pwa.js | Android installation prompt, iPhone instructions, offline/update status, phone navigation and stored planning inputs |
| JavaScript | sw.js | Service worker: required app/data cache, optional local-photo cache, path isolation and version updates |
| JSON | manifest.webmanifest | App name, Android icons, launch URL, scope, standalone display and shortcuts |
| JSON | catalogue.json | Car/variant records, specifications, checked dates and source links |
| SVG/PNG | icons/ | Editable brand icon plus Android/iPhone app icons and favicon |
| PNG/JPEG/WebP | cars/ | The eleven original locally available car photographs |
| JavaScript | tests/pwa.test.cjs | Nine automated installation, navigation, persistence, update and offline scenarios |
| Python, optional | run_local.py | Local static HTTP server; the app itself runs in the browser |
| Markdown/JSON/text | README.md, docs/ | Installation/deployment guide, image sources, release metadata and combined source |

No npm/pip packages are required to run the app. Browser APIs include DOM/events, Fetch, localStorage, native dialog, service workers, Cache Storage, MessageChannel and browser installation events. Optional Google Fonts are DM Sans and Manrope, with system-font fallbacks. There is no Django/SQL backend, AI model, cross-device account sync or live-price feed in this edition.

## GitHub and Vercel

1. Extract the ZIP and open the inner **PakAutoHub_Phone_App** folder.
2. Upload its contents to your existing GitHub repository, preserving the **cars**, **icons**, **tests** and **docs** folders. Replace the existing page/app files with these versions. Upload the extracted source, not only the ZIP.
3. Commit and push the update.
4. In Vercel select the folder containing **index.html** as Root Directory. If index.html is directly at repository root, keep the default root.
5. Use **Framework Preset: Other**, **Build Command: Override on and empty**, **Output Directory: .**, and the default Install Command. No environment variables are needed.
6. Deploy, then install from the resulting live HTTPS URL. A connected production branch deploys later commits according to your Vercel project settings.

GitHub Pages also works with this package. The manifest, assets and worker use relative paths, and offline caches are isolated by the hosting path. The app also works under a repository subdirectory.

## Offline use and updates

Open each browser/installed app once online, and wait for **Offline catalogue ready** in the installation guide before relying on offline use. Source links and the eight externally referenced used-car photos still need internet. Local photos are attempted separately so a photo failure does not block the tools. System fonts provide a fallback without internet.

Offline prices are the same dated catalogue snapshot; they are not refreshed live. Saved cars and planning inputs remain in that browser/app's storage and may be lost if the browser clears/evicts storage. A browser tab and an installed iPhone app may have separate storage; there is no account-based sync.

**For every later release that edits app files or catalogue data, increase CACHE_VERSION near the top of sw.js**, commit that file with the rest of the update and redeploy. The new worker caches the release. The old app remains usable until the user taps Refresh or all old tabs are closed. Other apps' caches are left alone.

## Local development

Use VS Code Live Server, or run `py run_local.py` on Windows (`python3 run_local.py` on macOS/Linux). Browse http://127.0.0.1:8000. Keep the terminal open and stop with Ctrl+C. Do not double-click index.html: file URLs do not support the full Fetch/service-worker installation flow.

A normal HTTP LAN URL from a laptop is not a secure context for phone service workers. Use the live HTTPS deployment to test installation on a real phone.

## Verification

With Node installed: `node --test tests/pwa.test.cjs`.

Nine automated tests passed for Android prompt reuse/confirmation, iPhone instructions and standalone launch, mobile navigation and counts, validation/persistence of planning inputs, explicit update refresh, root/subdirectory offline launches, cache isolation, required-data failure and optional-photo failure. JavaScript syntax, manifest/icon dimensions, all linked local assets, unique HTML IDs, preserved car data and ZIP integrity were checked. The hosted deployment completed successfully. Physical Android/iPhone installation and browser visual QA were not available in the development environment.

## Data scope and image attribution

Prices/specifications/source dates are preserved from the previous catalogue. Used prices are linked asking-price examples, not live inventory or guaranteed valuations. New Suzuki/Toyota checks are dated 10 October 2026; new Honda records retain the supplied 5 October snapshot. Representative photos can differ in trim/condition. See catalogue.json and docs/IMAGE_SOURCES.json for source links.

The budget suggestion uses body-style/new-car preferences and planned upfront cost, without invented safety/reliability scores. Fuel and upkeep calculations require user input. Allowances/petrol price are scenario assumptions; insurance, financing, depreciation and resale are excluded from the first-year cash plan.

`docs/ALL_CODE.txt` contains all executable/text app source in one document; the separate files are the runnable project.
