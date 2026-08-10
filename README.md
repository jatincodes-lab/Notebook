# Our Anniversary Scrapbook

An interactive eight-page anniversary scrapbook with 3D page turns, full/single-page views, a curved animated text ribbon, responsive mobile layouts, and a protected image-management dashboard.

## Run locally

```bash
npm install
npm run dev
```

- Scrapbook: `http://localhost:4173/`
- Admin: `http://localhost:4173/admin`

## Activate the admin backend

The public scrapbook works immediately with its placeholder photographs. Complete these steps once to enable dynamic uploads.

### 1. Create the Supabase project

Create a project at Supabase. In the project SQL Editor, run:

```text
supabase/migrations/001_scrapbook_admin.sql
```

This creates:

- `public.admins`
- `public.page_images`
- Public image reads
- Admin-only database writes
- The public `anniversary-images` storage bucket
- Admin-only upload, update, and delete policies
- Realtime publication for automatic scrapbook updates

### 2. Create the admin account

In Supabase, open Authentication > Users and create your email/password user. Then run this in SQL Editor, replacing the email:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict (user_id) do nothing;
```

### 3. Add local environment variables

Copy `.env.example` to `.env.local` and enter values from Project Settings > API:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Older Supabase projects can use `VITE_SUPABASE_ANON_KEY` instead. Never place a service-role key in this frontend.

Restart `npm run dev` after changing environment variables.

## Admin capabilities

- Password-protected `/admin` route
- Server-enforced admin authorization
- Page filtering
- Drag-and-drop image uploads
- JPEG, PNG, WebP, and GIF validation
- 6 MB input limit
- Browser-side resizing to a maximum 1800px dimension
- WebP conversion for ordinary photographs
- Replace and delete images
- Edit captions
- Open the live scrapbook preview
- Automatic public-book updates through Supabase Realtime

## Dynamic image slots

| Page | Slot | Purpose |
| --- | --- | --- |
| 1 | `intro-main` | Main beginning photograph |
| 3 | `little-left` | Left Polaroid |
| 3 | `little-right` | Right Polaroid |
| 5 | `gallery-left` | Left gallery Polaroid |
| 5 | `gallery-center` | Center gallery Polaroid |
| 5 | `gallery-right` | Right gallery Polaroid |

Slot definitions and placeholder images live in `src/bookConfig.js`.

## Deployment

The included `vercel.json` and `public/_redirects` preserve the `/admin` route on Vercel and Netlify. Add the same two Supabase environment variables to your hosting provider before building.