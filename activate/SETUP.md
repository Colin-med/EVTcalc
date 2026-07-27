# EVT Activate — setup guide

The board at **evtcalc.io/activate** works right now on any single device (and syncs across tabs on the *same* device). It stores everything locally in the browser — nothing is sent to a server until you turn on the two optional layers below.

Both layers are already coded into the app; you just add credentials.

---

## 1. Real-time sharing across everyone's phones (Supabase — free)

This makes the board update live on every team member's phone at once.

1. Create a free project at **supabase.com** (takes ~2 minutes).
2. In the project, open **SQL Editor**, paste the contents of **`supabase.sql`**, and run it. (Creates the `activations` table and turns on realtime.)
3. In **Project Settings → API**, copy your **Project URL** and **anon public key**.
4. In **`activate/index.html`**, near the top of the `<script>`, fill in:
   ```js
   const SUPABASE_URL = 'https://YOURPROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...your anon key...';
   ```
5. Commit/push — Netlify redeploys automatically. The badge in the header will read **"live sync."**

To share a specific activation, send teammates the URL with the code:
`https://evtcalc.io/activate/?a=NDGR` — they all see and edit the same board in real time.

**Locking it down (before real clinical use):** the demo SQL policy lets anyone with the anon key read/write. For production, enable **Supabase Auth**, restrict the policy to authenticated users, and consider scoping rows to the activation code. This is important because, even de-identified, activation data should not be world-writable.

---

## 2. One-tap SMS paging of the whole team (Twilio)

Without this, tapping **Text** / **Call** on a team member already opens your phone's messaging/dialer pre-filled — which needs no backend and works today. Twilio adds a single button that auto-texts *everyone at once* server-side.

1. Create a **Twilio** account and buy an SMS-capable number.
2. Move **`notify.example.js`** to **`netlify/functions/notify.js`** in the repo root.
3. In **Netlify → Site configuration → Environment variables**, set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM` (your Twilio number, e.g. `+15551234567`)
4. In **`activate/index.html`** set:
   ```js
   const NOTIFY_ENDPOINT = '/.netlify/functions/notify';
   ```
5. Commit/push. Now **"Text all with numbers"** pages the whole team via SMS in one tap; if the endpoint ever fails it falls back to opening your text app.

---

## Compliance note (read before real patient use)

This is an **operational coordination** tool, not a medical device, and it's designed to hold **no identifiers** (no name, no MRN — only age/NIHSS/occlusion/LKW). Even so, once you enable Supabase you are storing data on a server: put a **BAA** in place with your vendors where required, keep the data de-identified, restrict access with authentication, and clear this with your institution's privacy/security office and stroke leadership before using it on live activations.
