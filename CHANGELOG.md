# Changelog

All notable changes to the Lunar Gallery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased / Next Feature]
- (WIP) Auto-Ingest Pipeline & Search features on `feature/auto-ingest` branch.
- **Added:** Real-time search feature using case-insensitive SQLite queries and a glassmorphism UI overlay.

## [1.0.1] - 2026-02-24
### Fixed
- **Authentication:** `AUTH_URL` environment variable fixed to support Cloudflare Tunnel / reverse proxy redirects properly (no longer defaulting to localhost).
- **Documentation:** Updated README.md security section explicitly warning users to set `AUTH_URL` matching their production domain.

## [1.0.0] - Launch Release
### Added
- **Core:** Next.js 14 App Router integration with Prisma and SQLite.
- **Auth:** NextAuth.js setup for admin authentication using bcrypt hashed passwords.
- **Uploads:** Sharp integration for automatic image resizing (max 1080x1080).
- **Database:** Models for `Photo`, `Album`, and a singleton `AdminConfig`.
- **UI:** A completely custom, dark-mode cosmic design system built with Tailwind CSS (featuring deep space background, aurora text gradients, and glassmorphism panels).
- **Features:** 
  - Dynamic, editable site title.
  - Paginated gallery feed.
  - Masonry-style album covers mimicking Apple Photos.
  - Full-screen lightbox mode for photo viewing.
  - Admin-only routes for creating albums, uploading photos, and deleting items.
- **Docker:** Production-ready `Dockerfile` and `docker-compose.yml` with persistent volume mounts for database and uploaded images.
