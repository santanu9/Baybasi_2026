# Baybasi Website Prototype — MVP 1

This is a static public website prototype for Baybasi, a Bengali and Indian cultural nonprofit serving the San Francisco Bay Area.

## Project goal

Create a beautiful public information website first, while leaving clear placeholders for future CMS, login, payments, event registration, member portal, volunteer portal, and sponsor workflows.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript

No React, Next.js, Tailwind, Bootstrap, Node backend, CMS, or database are used in this MVP.

## Pages

- `index.html` — Home
- `about.html` — About Us, purpose, journey, board, corporate details, reports
- `impacts.html` — Impact numbers, charities, volunteering, testimonials
- `events.html` — Event calendar, featured event, media, publications
- `sponsors.html` — Sponsor benefits, tiers, sponsors, sponsor inquiry
- `join-us.html` — Membership, volunteering, subscription/event updates, contact forms

## Folder structure

```text
baybasi-website/
  index.html
  about.html
  impacts.html
  events.html
  sponsors.html
  join-us.html
  css/
    styles.css
  js/
    main.js
  assets/
    images/
    docs/
    icons/
```

## How to preview locally

Option 1: Open `index.html` directly in a browser.

Option 2: Use VS Code Live Server extension if installed.

Option 3: Use a simple local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## How to edit colors

Open `css/styles.css` and edit the `:root` variables:

```css
--color-primary: #B91C1C;
--color-maroon: #7F1D1D;
--color-gold: #F59E0B;
--color-cream: #FFF7ED;
--color-peach: #FFE4D6;
```

## How to replace images

Place final images in:

```text
assets/images/
```

Then update the relevant `<img>` paths in the HTML files.

Current images are SVG placeholders only.

## Forms

Forms currently use a static JavaScript mailto prototype that prepares an email to:

```text
baybasi@baybasi.us
```

For production, developers can replace this with:

- Formspree
- Netlify Forms
- Basin
- Google Sheets integration
- Custom backend
- CMS workflow

## GitHub Pages deployment

This project is static. It can be hosted from the repository root using GitHub Pages.

Basic flow:

1. Create a GitHub repository.
2. Upload all files from this folder.
3. Go to repository Settings → Pages.
4. Publish from the main branch and root folder.
5. GitHub Pages will use `index.html` as the homepage.

## Future Phase 2 placeholders

- CMS-driven content updates
- Admin/content manager access
- Media library
- Editable events
- Editable sponsors
- Editable impact numbers
- Editable reports/publications
- Role-based access control

## Future Phase 3 placeholders

- Member portal
- Volunteer portal
- Event registration
- Online payments
- Sponsorship payments
- Donation/support flow
- Member dashboard
- Sponsor dashboard
- Volunteer scheduling

## Developer notes

- Keep the site framework-free unless the team decides otherwise.
- Keep page sections modular so they can be moved around easily.
- Repeated content such as events, sponsors, board members, and impact stats should eventually be data-driven.
- Do not publish full residential/personal addresses on public pages.
- Donation/support CTAs are intentionally subtle; the main first impression should be culture, community, and credibility.
