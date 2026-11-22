# King Kebab – Netlify par daalna (FREE, customer ko login nahi chahiye)

1. app.netlify.com -> Add new site -> Import an existing project -> GitHub -> repo `nyroxplayz/kebab`.
2. Branch to deploy = `netlify`  (is branch mein Netlify ki files hain). Build command khali, Publish directory = public,
   Functions directory = netlify/functions (netlify.toml ye khud set karta hai). Deploy dabao.
3. Site configuration -> Environment variables: OWNER_PIN = tumhara owner PIN, STAFF_PIN = employee PIN.
   (PIN PEHLI request par set hote hain — site kholne se PEHLE daalo, phir Deploys -> Trigger deploy.)
4. Site name: Site configuration -> Change site name -> kingkebablardero  => https://kingkebablardero.netlify.app
   Panel: /admin ya PANEL button. Data (orders/menu/photos) Netlify Blobs mein save hota hai (extra database nahi chahiye).
