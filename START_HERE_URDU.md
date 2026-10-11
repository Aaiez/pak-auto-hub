# PakAutoHub ko apne laptop par chalana

1. ZIP download karke right-click → Extract All karein.
2. PakAutoHub_Complete_Source folder VS Code mein open karein.
3. Terminal → New Terminal kholein.
4. Agar Python installed hai, yeh command likhein:

   py run_local.py

5. Browser mein http://127.0.0.1:8000 khul jayega. Agar khud na khule to address manually paste karein.
6. Terminal khula rakhein. Server band karne ke liye Ctrl+C dabayein.

Agar `py` command nahi chalti lekin Python installed hai, `python run_local.py` try karein.
Agar port 8000 busy ho: `py run_local.py 8001`
Kisi package ko pip se install karna zaroori nahi.

## Kis file mein kya hai?

- dist/index.html: page ka structure, budget form aur buttons.
- dist/style.css: colours, design aur mobile layout.
- dist/app.js: company tabs, filters, saved cars, car details aur comparison.
- dist/core.js: budget aur fuel ke formulae.
- dist/catalogue.json: sari gariyon ka data, prices aur source links.
- dist/cars: downloaded car pictures.

Website ka yeh latest version HTML/CSS/JavaScript par hai. Original ZIP wali Django website se alag version hai. Is mein login/admin backend nahi hai. Python sirf local preview ke liye use hota hai.

New photo lagane ke liye photo dist/cars mein rakhein aur us car ke image field mein cars/filename.jpg likhein. Purane model par naye model ki photo na lagayein. Kuch used-car photos abhi external links hain aur internet ke baghair load nahi hongi.
