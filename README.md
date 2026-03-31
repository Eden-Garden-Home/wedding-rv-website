# Wedding RV Website

Single-page wedding website for Valentina and Riccardo, built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Framer Motion.

The project is designed to feel editorial and premium, with a warm palette, paper textures, elegant typography, soft motion, and an opening letter-style intro.

## Overview

The site is structured as a single landing page, optimized mainly for mobile, with the core wedding details presented in one continuous flow:

- immersive animated letter intro
- hero section with a quick event summary
- ceremony section
- reception section with map link
- gift section with a switch between bank transfer and registry
- closing section with a final message from the couple

The overall visual direction is built around the tree motif: roots, growth, light, and shared future.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- `next/font` for optimized font loading
- static metadata in `app/layout.tsx`
- `standalone` output for Node.js and Docker deployment

## Key Features

- Cinematic intro with `sessionStorage` persistence, so it is not shown again on every refresh.
- `prefers-reduced-motion` support to keep animations accessible.
- Centralized editable content in a single data file.
- Simple architecture: one page assembled from reusable sections.
- Production-friendly Docker setup with a multi-stage image build.

## Requirements

- Node.js 22 recommended
- npm 10+

No environment variables are required for the basic project setup.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Where to Edit Content

Almost all editorial content is centralized in:

```text
data/site-content.ts
```

From there you can update:

- couple names
- intro and closing copy
- ceremony date, time, and details
- reception location and logistics
- Google Maps link
- IBAN
- wedding registry link
- floating navigation labels

## Pre-Launch Checklist

The current content still includes a few placeholders that should be completed before the final launch:

1. Add the full reception address.
2. Confirm that the Google Maps link points to the exact venue.
3. Fill in the final IBAN value.
4. Add the real wedding registry URL, if needed.
5. Review SEO and social metadata in `app/layout.tsx`.

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  ambient-backdrop.tsx
  ceremony-section.tsx
  final-section.tsx
  floating-nav.tsx
  gift-section.tsx
  hero-section.tsx
  intro-letter.tsx
  reception-section.tsx
data/
  site-content.ts
lib/
  utils.ts
public/
  decor/
  textures/
Dockerfile
docker-compose.yml
```

## Implementation Notes

- The homepage is assembled in `app/page.tsx` using typed content and reusable sections.
- Page metadata is defined in `app/layout.tsx`.
- Google fonts are handled through `next/font/google`, so they are optimized by the framework.
- The project uses `output: "standalone"` in `next.config.ts` for a leaner production build.

## Docker

### Build the image

```bash
docker build -t wedding-rv-website .
```

### Run with Docker Compose

```bash
docker compose up -d --build
```

The site will be available at [http://localhost:3000](http://localhost:3000).

### Stop the containers

```bash
docker compose down
```

## Deployment

The project can be deployed in two straightforward ways:

### 1. Node.js server

```bash
npm install
npm run build
npm run start
```

### 2. Docker container

Use the included `Dockerfile`. The final image copies only the files required at runtime thanks to Next.js standalone output.

## Quality Checks

Before opening or updating a PR:

```bash
npm run lint
npm run typecheck
npm run build
```

## Possible Extensions

- custom OG image for WhatsApp and social sharing
- custom wedding favicon
- RSVP or attendance confirmation form
- countdown to the event date
- post-event photo gallery

## License

Private repository for internal use.
