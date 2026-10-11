# PakAutoHub — Complete Website Source

This is the source of the published version 2 website, exported 11 October 2026.
Source commit: 6208c7c50006662b9f6d62526796b0e1f03de48c
Website: https://pakautohub-aaiez.sagetoad8.chatgpt.site

## Included
- dist/index.html — page layout and controls
- dist/style.css — styling and responsive layouts
- dist/app.js — company tabs, search, filters, details, saved cars and comparison UI
- dist/core.js — budget, shortlist and fuel-cost calculations
- dist/catalogue.json — 19 new/used entries, 31 price/variant records, specifications and source links
- dist/cars/ — all 11 locally stored car images
- run_local.py — optional standard-library local preview server
- START_HERE_URDU.md — Windows instructions and editing guide
- TECHNICAL_NOTES.md — data scope and limitations
- IMAGE_SOURCES.json — local/external image inventory

## Run locally
Install Python 3 if not already available. Open a terminal in this extracted project folder:

    py run_local.py

On macOS/Linux use: python3 run_local.py
Open http://127.0.0.1:8000 if the browser does not open automatically.
Stop with Ctrl+C. No pip or npm install is required.
Alternatively serve dist/ with any static HTTP server, including VS Code Live Server.
Do not simply double-click index.html: the browser may block loading catalogue.json via file://.

## What this version uses
HTML, CSS, JavaScript and JSON. Python is only an optional local preview server, not an application backend. The published site has no Django/PHP backend, SQL database, admin login or account system. Saved cars use browser localStorage.

## Images and third-party content
Every locally stored asset is included unchanged. Eight used-car images still use external URLs because they could not be downloaded; some may show the photo-unavailable fallback. All image URLs and captions are recorded in IMAGE_SOURCES.json and catalogue.json. Internet is also needed for optional Google Fonts. System fonts are used if these cannot load. Manufacturer and seller images remain third-party content; this export does not grant ownership of them.

## Edit and deploy
Open this folder in VS Code. Change files in dist/. For a car edit, update catalogue.json and retain valid JSON. Use a local image path such as cars/my-car.jpg after putting the matching photo into dist/cars/. The current company-tab list is defined in renderBrands() in app.js, so adding another brand also requires updating that list. Several home-page summary counts are in index.html and should be adjusted when changing the catalogue size.

Upload the contents of dist/ to a static web host. No build command is required; index.html must be at the served root. Exporting or editing this ZIP does not update the existing hosted site automatically. Hosting account credentials, Git history and service-specific Site identity are intentionally not included in this portable source export.

Used prices are dated asking-price samples, not live offers. Fuel, fees and repair reserves are user-editable assumptions. See TECHNICAL_NOTES.md for calculation scope.
