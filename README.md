# Nova Site

A lightweight single-page website for a creative/podcast studio, built with plain HTML and static assets.

## What this repo is

This repository is intentionally simple: a static marketing site that can be hosted on GitHub Pages, Netlify, Cloudflare Pages, or any basic web server.

It is useful as a small reference/starter for people who want to build a clean service-business landing page without a framework or build step.

## Features

- Single-page static site
- No framework required
- No database
- No backend
- No API keys or runtime secrets required
- Responsive layout
- Simple asset structure

## Run locally

Clone the repository and open `index.html` in your browser, or serve the folder with any static web server.

For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```text
.
├── index.html
├── images/
└── og.jpg
```

## Customising it

You can replace the copy, images, branding and links directly in `index.html` and the `images/` directory.

## Contributing

Small fixes and improvements are welcome. See `CONTRIBUTING.md`.

## Security

Please do not commit credentials, tokens or private customer data. See `SECURITY.md`.

## Licence

MIT. See `LICENSE`.
