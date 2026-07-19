# Data Standards

This is the permanent, project-wide reference for how Job Radar stores and
presents data, across every importer, the backend, and the frontend. It is
the standard other docs point to:
[`docs/COMPANY_ONBOARDING_STANDARD.md`](COMPANY_ONBOARDING_STANDARD.md)
covers the process for adding a company/importer; this file defines the
data shape and formatting rules that process must follow.
[`docs/UI_DISPLAY_STANDARD.md`](UI_DISPLAY_STANDARD.md) covers how the
frontend renders that data once stored — its rules must not conflict with
this one.

## Countries

- Canonical storage uses ISO 3166-1 alpha-2 codes when available.
- Frontend always displays full English country names.
- Filtering uses full country names.
- Never display raw ISO codes.

## States / Regions

When available, preserve official values.

Examples:
- California
- Texas
- England
- Scotland
- Bavaria

Do not invent missing values.

## Cities

Preserve official source values.

Do not rename cities.

## URLs

Official URLs are canonicalized before comparison.

Tracking parameters are removed.

Job identifier parameters are preserved.

## Dates

Use ISO 8601 internally.

Frontend formats dates for users.

## Company names

Always preserve official names.

Never abbreviate company names.

## Job titles

Preserve official titles.

No normalization.

## Studios

Preserve official studio names.

Frontend displays "Studios" as the UI label.

## Departments

Preserve official department names.

No rewriting.

## Principle

Backend stores canonical official data.

Frontend formats only for presentation.

Never fabricate missing data.
