# King Kebab – Cloudflare par daalna (FREE, customer ko login nahi chahiye)

1. github.com par free account -> New repository (naam: king-kebab).
2. Zip kholo, andar ki SAARI files/folders (public, src, lib, seed.js, wrangler.toml, package.json ...) repo mein
   "Add file -> Upload files" se upload karo.
3. dash.cloudflare.com par free account banao -> Workers & Pages -> Create -> "Import a repository" -> GitHub -> repo chuno.
   Build settings wese hi rehne do, "Deploy" dabao. (wrangler.toml sab bata deta hai.)
4. Deploy ke baad: Worker -> Settings -> Variables and Secrets -> 2 secrets add karo:
     OWNER_PIN = tumhara owner PIN        STAFF_PIN = employee PIN
   PIN PEHLI request par set hote hain, isliye site khulne se PEHLE ye secrets daalo (nahi to default owner123/staff123 ban jate hain
   — phir Panel > Ajustes se badal lena).
5. Site: https://king-kebab.<tumhara-naam>.workers.dev   |   Panel: right side wala PANEL button ya /admin

Data (orders, prices, photos, reviews) Durable Object mein save hota hai (redeploy par nahi jata).
Panel naya order 12 second ke andar dikha deta hai (panel tab khuli aur visible honi chahiye).

Local test: node tools/dev-cloudflare.mjs  -> http://localhost:3300
