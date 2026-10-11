# GitHub ke liye tamam source code

Website ki main coding HTML, CSS aur JavaScript mein hai. Car records JSON mein hain. Python ki file sirf local preview server ke liye hai; asal website browser mein JavaScript chalati hai.

## Files ka kaam

- index.html: page structure aur budget form.
- style.css: complete design aur mobile layout.
- app.js: company tabs, car cards, search, filters, saved cars, details aur comparison.
- core.js: budget, price range, fuel aur shortlist formulae.
- catalogue.json: sari gariyon ka data aur source links.
- cars/: tamam locally available photos.
- run_local.py: optional localhost server.
- docs/ALL_CODE.txt: sab code ek file mein.

## GitHub mein upload

1. ZIP par right-click karke Extract All karein.
2. Andar PakAutoHub_GitHub_Source folder kholein.
3. GitHub repository mein Add file → Upload files kholein.
4. Folder ke andar ki sari files, cars folder aur docs folder drag-and-drop karein.
5. Commit message likh kar save/commit karein. GitHub jo commit/proposal button dikhaye use complete karein.

Asal code repository mein dikhane ke liye ZIP ke andar ka extracted code upload karein. Folder structure barqarar rakhein; cars folder ko rename karne se photo paths bhi update karni hongi.

## Laptop par chalana

VS Code mein poora project folder kholein. Live Server se index.html khol sakte hain. Python installed ho to terminal mein `py run_local.py` bhi chala sakte hain. Browser address http://127.0.0.1:8000 hai. Kisi Python package ko install karne ki zaroorat nahi.

Yeh current published frontend version hai. Original Django project se alag hai; uska login/admin backend is export ka hissa nahi hai. README.md mein tamam technologies aur current version ki limitations explain ki hui hain.
