# Alicer AI – Model & Product Name Generator

A lightweight, elegant name generator for AI models, products, features, and code names. Dual engine with curated Alicer Mode and optional Gemini Mode.

## Features

- Smart naming system from flowers, gems, aura, stellar, and mythic words
- Automatic version pairing: `Nano`, `Mini`, `Base`, `Large`, `Pro`, `Ultra`
- Style balance slider from cute → elegant → professional
- Dual engine: `Alicer Mode` (offline) and `Gemini Mode` (API-key optional)
- Modern UI with smooth animations, responsive layout, and export tools

## Quick Start

- Open `index.html` directly in a browser
- Use `Alicer Mode` to generate names instantly with no network
- Switch to `Gemini Mode` and enter your Gemini API key if desired

## Optional Local Server

You can serve the folder locally if needed:

- Python: `python -m http.server 8000`
- Node (http-server): `npx http-server -p 8000`

Visit `http://localhost:8000/` and open `index.html`.

## Gemini Mode

- Model: `gemini-1.5-flash`
- Input your API key in the `Gemini API Key` field
- The app sends a single prompt and expects a newline-separated list of names

### Security Notes

- Keys are not stored; they remain only in memory during the session
- For production, proxy Gemini requests through a backend and keep keys server-side

## Export

- Copy names: `Copy`
- Export JSON: `Export JSON` → `alicerai-names.json`
- Export CSV: `Export CSV` → `alicerai-names.csv`

## Project Structure

```
index.html
styles/app.css
src/app.js
README.md
```

## Branding

Place your logo at `assets/alicerai-logo.png` and add it to the header if desired.

## License

MIT