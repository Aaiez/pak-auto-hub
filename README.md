# PakAutoHub

A responsive Pakistan car catalogue for exploring new and used cars, comparing variants, and planning a purchase within your budget.

**Project by Aaiez Arshad.** This package contains the complete frontend source of the published version 2, reformatted for reading. It preserves the current website's behavior and dataset. Website: https://pakautohub-aaiez.sagetoad8.chatgpt.site (access depends on the existing Site's sharing settings).

## Languages and file roles

| Technology | Files | Purpose |
|---|---|---|
| HTML | index.html | Page structure, navigation, forms, buttons and dialog containers |
| CSS | style.css | Colors, layout, typography, cards, responsive rules and animations/transitions |
| JavaScript | app.js | Company tabs, fetching car data, search, filters, saved cars, details, comparison and event handlers |
| JavaScript | core.js | Price ranges, upfront cost, fuel cost, budget status, filters and preference-based shortlisting |
| JSON (data format) | catalogue.json | 19 model-year entries, 31 variant/price records, specifications, dates and source URLs |
| Python (optional) | run_local.py | Local static HTTP server and automatic browser opening; not the website's application backend |
| Markdown (documentation) | README.md, docs/START_HERE_URDU.md | Project explanation and instructions |
| Images | cars/ | All 11 locally stored PNG, WebP and JPEG assets |
| JSON (metadata) | docs/IMAGE_SOURCES.json | Source URLs and captions for local and externally referenced photos |

## Features

- Separate Toyota, Honda, Suzuki and Hyundai tabs.
- New and used entries distinguished by model year.
- Search by brand/model/year; filter by condition, body type, year and purchase budget.
- Price and name sorting.
- Save a shortlist using browser localStorage.
- Variant details and manufacturer/asking-price source links.
- Compare up to three new or used cars.
- 30-lakh example: new Alto, used City and used Corolla.
- Budget finder with editable transaction allowance and used-car repair reserve.
- Editable purchase quotes, fuel economy and yearly upkeep in the comparison cash plan.

## Browser features and dependencies

JavaScript uses the browser DOM and events, Fetch API, localStorage, Intl.NumberFormat and native HTML dialog. CSS uses Grid, Flexbox, media queries and focus styling. Optional Google Fonts are DM Sans and Manrope, with system-font fallbacks. Browser fonts and external image references require internet.

This export has no npm/pip dependency installation or frontend build step. Node.js is optional for developer syntax checks. The current hosted edition has no SQL database, account login, Django application backend, React or PHP. Its recommendation logic is rule-based; no AI model or live-price API is called.

## Run locally

Open the extracted project folder in VS Code. Use VS Code Live Server on index.html, or run the optional Python helper:

```bash
py run_local.py
```

On macOS/Linux:

```bash
python3 run_local.py
```

The server opens http://127.0.0.1:8000. Keep the terminal open; stop with Ctrl+C. If that port is in use, run `py run_local.py 8001`.

Opening index.html by double-clicking can prevent the browser from fetching catalogue.json. Use an HTTP server for the complete experience.

## Upload the source to GitHub

1. Extract PakAutoHub_GitHub_All_Languages.zip.
2. Open the inner PakAutoHub_GitHub_Source folder. index.html, style.css, app.js, core.js and catalogue.json should be directly inside it.
3. Open your GitHub repository and select Add file → Upload files.
4. Drag the contents of this folder into the upload area, including the cars and docs folders. Preserve folder structure. Upload the extracted code rather than keeping all source only inside a ZIP.
5. Enter a commit message such as `Add complete PakAutoHub website source` and complete the commit/proposal shown by GitHub.

Official guide: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

If you have already cloned the repository locally, copy these files into it and use your chosen Git workflow to commit and push. This package exports source; it does not change your current hosted Site automatically.

## Read all code in one place

`docs/ALL_CODE.txt` includes the complete HTML, CSS, both JavaScript files, JSON data and optional Python script. The separate files at the project root remain the executable source.

## Edit the catalogue

Edit catalogue.json while retaining valid JSON. Put a correctly matched local photo into cars/ and use `cars/your-photo.jpg` as the image path. Source URLs and recorded dates should accompany prices. When changing catalogue size, update the home-page counts in index.html. To add another manufacturer tab, also update renderBrands() in app.js.

## Data and calculation scope

There are nine new entries and ten used entries. New Suzuki/Toyota prices use dated 10 October 2026 manufacturer checks; new Honda entries retain the 5 October snapshot. Used prices are linked asking-price samples/groups, with location and scope shown per entry. They are not confirmed completed-sale values or live seller inventory.

The shortlist considers body-style/new-car preference and estimated upfront cost. It does not inspect mechanical condition or score crash safety/reliability. Comparison defaults to a used range midpoint until replaced by an actual quote. Fuel costs require a visitor-entered km/l estimate; yearly cash planning also requires upkeep input. Scenario fees, petrol price and repair reserves are editable assumptions, not live official quotes.

All 11 available local images are included unchanged. Eight used-car image references remain external and may use the photo-unavailable fallback. Third-party images remain their owners' content. Source/caption metadata is included.

## Checks performed on this export

JavaScript formatting was checked against the original parsed syntax trees. CSS significant tokens and HTML elements/attributes/text were verified. JSON and local assets are preserved. Static server paths and ZIP integrity are checked. Browser visual QA was not available in the build environment.
