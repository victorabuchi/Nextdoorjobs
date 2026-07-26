# HireKeeper — Phase 1 (static MVP)

Two-sided site: homeowners create a job listing on `hire.html` and get a
shareable link; anyone who opens that link (`job.html`) can view the job and
apply on `work.html`. Every form submits straight to a Google Form, so
submissions land in a Google Sheet automatically, and you can turn on email
alerts inside Google Forms — no backend, no cost, no Google Workspace/business
account needed (a regular free Google account is enough).

## How the shareable link works

There's no database. When a listing is created, its details (service type,
location, notes — **not** the client's name/email/phone) are encoded directly
into the URL. `job.html` just reads whatever's in the link and displays it.
That means the link *is* the listing — share it anywhere, and anyone who
opens it sees the job, with zero server involved. The applicant's own
submission (and a reference back to which listing they applied to) goes to
your Job Seekers Google Form as usual.

## 1. Create the two Google Forms

Two separate forms, one per side. Go to forms.google.com → Blank form.

### Form A — "HireKeeper: Job Seekers" (feeds `work.html`)
1. Short answer — Work type
2. Short answer — City
3. Short answer — State / Province
4. Short answer — Country
5. Short answer — Full name
6. Short answer — Email
7. Short answer — Phone / WhatsApp
8. **Paragraph** — Job reference *(leave this blank when someone applies without a link — it only fills in when they arrive via a shared job listing)*

### Form B — "HireKeeper: Clients" (feeds `hire.html`)
1. Short answer — Service type
2. Short answer — City
3. Short answer — State / Province
4. Short answer — Country
5. Short answer — Full name
6. Short answer — Email
7. Short answer — Phone / WhatsApp
8. Paragraph — Details (optional)

On each form: **Responses** tab → green Sheets icon → **Create spreadsheet**.
Then kebab menu (⋮) → **Get email notifications for new responses**.

## 2. Find your entry IDs

For each form:
1. **Send** → link icon → copy the link (opens the live form at a URL like
   `https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxx/viewform`).
2. Open it, right-click → **View Page Source**.
3. Ctrl+F for `entry.` — one per field, e.g. `entry.1234567890`. Match each
   to its field by the order you added them.
4. Your submit URL = the viewform URL with `viewform` swapped for
   `formResponse`.

## 3. Wire it up

Open `js/main.js`, replace the placeholders in `CONFIG.work` and
`CONFIG.hire` with your real `actionUrl` and `entry.xxxx` IDs — including
`jobRef` for the work form (field 8 above).

## 4. Run it locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Test the full loop: create a listing on
`hire.html` → confirm the row lands in the Clients sheet → copy the share
link → open it in a new tab → apply on `work.html` → confirm that row lands
in the Job Seekers sheet with the Job reference field filled in.

## 5. Push to GitHub

```bash
cd hirekeeper
git init
git add .
git commit -m "feat: initial HireKeeper static site with shareable job listings"
git branch -M main
git remote add origin git@github.com:victorabuchi/hirekeeper.git
git push -u origin main
```

(Create the empty `hirekeeper` repo under your GitHub account first.)

## 6. Deploy

Same path as Frozenholm and Rannikon Puutarha: Render → New → Static Site →
connect the `hirekeeper` repo → build command empty, publish directory `.` →
deploy. Point your domain at it once picked and connected in Render.

## A note on the shared link

Because the job data lives entirely in the URL, listing links are long. This
is normal (Google's own prefilled-form links look the same) and doesn't need
fixing for an MVP — but if you want short, clean links later (e.g.
`hirekeeper.com/j/8f3a`), that needs a real database to look up an ID against
stored job data. That's a natural piece of Phase 2.

## Phase 2 (later)

Once leads pick up: swap the Google Form calls for your own Fastify +
Postgres backend (same stack as Knewler/Rannikon). That unlocks: short
listing URLs, a login-gated dashboard, status tracking per lead and per
listing, and closing/expiring listings — without changing these page
templates.
