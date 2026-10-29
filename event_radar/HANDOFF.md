# Club Event Radar — teammate handoff

## What works now

Website: [Club Event Radar](https://kaconde.github.io/BUS4498_InClass_Builds/event_radar/)

The site lists published events, accepts text announcements and optional JPG/PNG flyers, and shows the AI agent's results. The `submit-event` Edge Function uses Claude and holds posts needing review. Moderator sign-in can approve or reject waiting posts.

## Where things live

- Repository: `BUS4498_InClass_Builds`. GitHub Pages serves the repository root; the root `index.html` forwards to `event_radar/`.
- Supabase project: `event-radar`
- Project URL: `https://ajfyzpyxeygkfyvglzdm.supabase.co`
- Website files: `event_radar/index.html`, `app.js`, `config.js`, and `style.css`
- Agent: `event_radar/supabase/functions/submit-event/index.ts`
- Database migrations: `event_radar/supabase/migrations/`
- Agent rules and examples: `event_radar/context/` and `event_radar/test/`
- Backend pieces: the `public.events` table, `submit-event` Edge Function, public `flyers` storage bucket, and the moderator Auth account.

## Secrets

- `ANTHROPIC_API_KEY`: Supabase Dashboard → Edge Functions → Secrets. The agent uses it; the teammate does not need its value.
- Optional `OPENAI_API_KEY` and `HOLD_ALL_POSTS`: stored in the same Supabase Secrets area if those features are used.
- `config.js` may contain only the public Project URL and publishable key. Never put service-role, database-password, or AI keys in the repository.

## How to test

1. Submit the clean sample in `event_radar/test/sample-announcements.md`; it should be published and appear on the board.
2. Submit the same event again; it should be identified as a duplicate.
3. Submit one of the incomplete, off-campus, alcohol, payment, or contact-only examples; it should wait for moderation with reasons.
4. Submit `event_radar/test/sample-flyer.png` with its sample text; it should extract the event details, save the flyer, and wait for moderation.
5. Sign in as the moderator, approve the flyer post, and confirm it appears publicly.

## What’s next

- Upload the current uncommitted changes with GitHub Desktop and verify the hosted website.
- Confirm GitHub Pages is deploying from the repository's `main` branch and root folder.
- Test moderator sign-in and approval on the hosted site, not only from a local file.
- Optional: add the nightly cleanup migration described in `AGENTS.md` to archive past events.
- Consider enabling Supabase leaked-password protection. The Supabase advisor may also report multiple permissive policies; the authenticated moderator policy is intentional.

## How we take turns

Download or pull the latest `main` before working. Tell the teammate before changing files or Supabase. When finished, review the changes, commit and upload through GitHub Desktop, and tell the teammate what changed.
