# King Kebab – Vercel par daalna (FREE, customer ko login nahi chahiye)

1. GitHub repo (jo already hai: nyroxplayz/kebab) ya zip ki files use karo.
2. vercel.com par free account (GitHub se login) -> Add New -> Project -> repo chuno -> "Deploy".
   (Framework: "Other". Build command khali, Output Directory = public — vercel.json ye khud set karta hai.)
3. DATABASE (zaroori): Vercel project -> Storage -> Create / Marketplace -> "Upstash Redis" (Free plan) -> Connect to project.
   Ye apne aap env variables daal deta hai (KV_REST_API_URL, KV_REST_API_TOKEN). Phir Deployments -> Redeploy.
4. PIN: Settings -> Environment Variables:  OWNER_PIN = tumhara owner PIN   STAFF_PIN = employee PIN
   (PEHLI request par set hote hain — isliye PIN Redeploy se PEHLE daalo, warna default owner123/staff123 ban jate hain.)
5. Domain: Settings -> Domains -> kingkebablardero.es add karo. Vercel jo DNS records dikhaye wo domain ke DNS mein daalo
   (agar domain Cloudflare mein hai to wahan "A 76.76.21.21" aur "www CNAME cname.vercel-dns.com", proxy OFF / DNS only).
   Dhyan: ek domain ek hi jagah (Cloudflare YA Vercel) chalta hai.

Site: https://<project>.vercel.app   |   Panel: /admin ya right side PANEL button.

Photos upload: Upstash free request limit ~1 MB hai — panel se chhoti photos (<700 KB) upload karo.
Local test (bina internet): node tools/test-upstash.mjs
