# ism.raw — Photography Portfolio

Personal film photography portfolio. Built with Jekyll, hosted on Cloudflare Pages, managed via Pages CMS.

---

## Live Site

**[ism-raw-portfolio.pages.dev](https://ism-raw-portfolio.pages.dev)**

---

## Editing Content (No Code Required)

Use **[Pages CMS](https://app.pagescms.org)** to edit text, captions, and photos visually.

1. Go to [app.pagescms.org](https://app.pagescms.org)
2. Sign in with GitHub
3. Select repo: `ismailbenchekroun/ism.raw-portfolio`
4. Edit anything — every save commits to GitHub and rebuilds the site (~1 min)

### What you can edit from the CMS

| Section | What you can change |
|---|---|
| **Homepage** | Hero title, body text, hero image, journey photos |
| **Gallery Collections** | Titles, descriptions, cover images, URLs |
| **Each gallery** | Add/remove photos, edit captions |
| **About** | Name, bio, portrait photo |
| **Site Settings** | Email, location, footer address |

---

## Adding a New Gallery

### Step 1 — Add your images

Put your photos in a new folder under `images/`:
```
images/
  My New Gallery/
    photo1.jpg
    photo2.jpg
```

### Step 2 — Create the data file

Create `_data/gallery_myname.yml` (copy an existing one and edit):
```yaml
title: "My New Gallery"
subtitle: "Subtitle here"
description: "A short description."
cover: "/images/My%20New%20Gallery/photo1.jpg"
photos:
  - image: "/images/My%20New%20Gallery/photo1.jpg"
    caption: ""
  - image: "/images/My%20New%20Gallery/photo2.jpg"
    caption: ""
```

> **Note on special characters in folder names:** spaces → `%20`, `&` → `%26`. So `B&W Esquisse` becomes `B%26W%20Esquisse` in paths.

### Step 3 — Create the gallery page

Create `gallery/my-gallery.html`:
```html
---
layout: gallery_page
title: My New Gallery
gallery_data: gallery_myname
---
```

### Step 4 — Add it to the gallery picker

Open `_data/galleries.yml` and add an entry:
```yaml
- id: my-gallery
  title: "My New Gallery"
  subtitle: "Subtitle"
  description: "Short description."
  cover: "/images/My%20New%20Gallery/photo1.jpg"
  cover_alt: "Description of cover photo"
  url: "/gallery/my-gallery"
```

### Step 5 — Add it to the CMS (optional)

Open `admin/config.yml` and add a new collection block (copy an existing gallery entry and rename).

### Step 6 — Commit and push

```bash
git add .
git commit -m "Add My New Gallery"
git push origin main
```

Cloudflare Pages will rebuild automatically.

---

## Current Galleries

| Gallery | Data file | Page |
|---|---|---|
| London Q1-2026 | `_data/gallery_london.yml` | `gallery/london-q1-26.html` |
| 4L | `_data/gallery_4l.yml` | `gallery/4l.html` |
| Guatemala | `_data/gallery_guatemala.yml` | `gallery/guatemala.html` |
| Portsu | `_data/gallery_portsu.yml` | `gallery/portsu.html` |
| B&W Esquisse | `_data/gallery_bw.yml` | `gallery/bw-esquisse.html` |
| Divers | `_data/gallery_divers.yml` | `gallery/divers.html` |

---

## File Structure

```
ism-raw-portfolio/
├── _data/                  # All content lives here (YAML)
│   ├── galleries.yml       # Master list for the gallery picker
│   ├── gallery_london.yml  # London gallery photos + captions
│   ├── gallery_4l.yml      # 4L gallery
│   ├── gallery_guatemala.yml
│   ├── gallery_portsu.yml
│   ├── gallery_bw.yml
│   ├── gallery_divers.yml
│   ├── home.yml            # Homepage text + images
│   ├── about.yml           # About page content
│   └── site.yml            # Footer: email, location, address
├── _layouts/
│   ├── default.html        # Base layout (nav, gallery picker, lightbox)
│   └── gallery_page.html   # Reusable gallery page layout
├── _includes/
│   ├── nav.html            # Navigation bar
│   └── footer.html         # Footer
├── gallery/                # One .html file per gallery
├── images/                 # All photos, organised by gallery folder
├── css/style.css           # All styles (dark mode, layout, animations)
├── js/main.js              # Dark mode, lightbox, scroll animations
├── admin/config.yml        # CMS configuration
└── _config.yml             # Jekyll config
```

---

## Keeping It Neat

**Compress images before uploading.** Raw scans can be 4–8MB each — that makes pages slow. Run them through **[squoosh.app](https://squoosh.app)** before adding to the repo. Aim for under 500KB per photo (MozJPEG at 80% quality is a good setting).

**Keep folder names consistent.** Use the same capitalisation and spacing as the folder when writing paths in YAML — or URL-encode as shown above.

**One gallery = one folder + one data file + one HTML page.** Don't mix photos from different shoots in the same folder; it'll be hard to manage later.

**Captions are optional.** Leave `caption: ""` if you don't want one. They only show in the lightbox.

**The gallery picker cover image** is the one defined in `_data/galleries.yml` under `cover:` — make it a strong, portrait-oriented shot.

**Dark mode** is toggled by the user and remembered across visits. No action needed from you.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Jekyll](https://jekyllrb.com) | Static site generator |
| [Cloudflare Pages](https://pages.cloudflare.com) | Free hosting, auto-deploys on push |
| [Pages CMS](https://app.pagescms.org) | Visual editor, no server needed |
| GitHub | Repo + version history |

**Build command:** `bundle exec jekyll build`
**Output directory:** `_site`
**Branch:** `main`

---

## Running Locally

```bash
bundle install
bundle exec jekyll serve
```

Then open [localhost:4000](http://localhost:4000).
