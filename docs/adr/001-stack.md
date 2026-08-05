# ADR-001: Stack Selection

## Status
Accepted (locked Slice 0)

## Context
Need a static-deployable web SPA with 3D training range, KaTeX math, and fast iteration.

## Decision
Vite + React + TypeScript + React Three Fiber / Three.js + KaTeX.

## Consequences
- Excellent GH Pages / itch.io fit (`base: './'`)
- Shared TS types between content scripts and app
- Bundle size watched for mobile; drei helpers used sparingly
