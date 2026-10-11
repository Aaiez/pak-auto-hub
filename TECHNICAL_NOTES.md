# PakAutoHub

Buildless, responsive Pakistan car research catalogue. Publish `dist/` through the Sites source workflow and retain `.openai/hosting.json` identity.

## Data and features

19 model-year entries: 9 new and 10 used, with company tabs for Toyota, Honda, Suzuki and Hyundai. Search, body/year/condition/budget filters, browser-local saved cars, up to three compared cars, editable budget finder and first-year cash planning.

Sources and dates live in `dist/catalogue.json`. Used entries are asking-price research examples, not active inventory or a statistical valuation. Locations and sample scope are explicit. New Suzuki/Toyota data checked 10 October 2026; Honda new-car entries retain the supplied 5 October snapshot. Toyota showroom entries represent starting prices with exact trim to be confirmed.

Budget suggestions are rule-based on condition/body-style preference and upfront costs; no safety, mechanical condition or reliability scores. Used range lower and upper bounds are distinguished. Comparison defaults to the used range midpoint and accepts actual seller quotes. Fuel economy and annual maintenance must be entered by the visitor. Scenario petrol price and allowances are clearly labeled and editable. The first-year cash plan excludes financing, insurance, depreciation and resale proceeds.

Manufacturer and third-party model-year photographs carry representative-image disclosures and source links. Some externally hosted photographs could not be downloaded from this environment; the UI uses their observed source URLs with an explicit photo-unavailable fallback. It never substitutes another generation's image.

## Verification

`node --check dist/app.js` and `node --check dist/core.js`. Core calculations cover the 30-lakh new/used boundary, repair reserve behavior, partially affordable used ranges, filter combinations, missing fuel inputs and shortlist selection. Browser visual QA was unavailable in this environment.
