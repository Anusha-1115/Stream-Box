# StreamBox

A responsive, Netflix-inspired streaming UI built with **HTML, CSS and vanilla JavaScript** (no frameworks).

## Features
- Landing page with hero, ranked Trending row and animated FAQ accordion
- Demo sign in / sign out (email only, validated, kept in localStorage)
- Browse page with featured banner and horizontally scrolling category rows
- Live data from the TMDB API (Trending, Top Rated, Bollywood, Action, Comedy, Horror, Romance)
- Debounced search, movie details modal, embedded YouTube trailers
- "My List" saved in localStorage
- Responsive layout, keyboard focus styles, reduced-motion support
- Falls back to demo data if there is no API key or the API is unreachable

## Run it
1. Get a free API key at https://www.themoviedb.org/settings/api
2. Paste it into `API_KEY` at the top of `script.js`
3. Open `index.html` (or use VS Code Live Server)

Keep your `assets/` folder next to these files (`3_idiots_poster.jpg`, `dangal.jpg`, `netflix-backg.webp`).

## Deploy
Push to GitHub and enable GitHub Pages, or drag the folder into Netlify.
Note: a TMDB key in front-end code is visible to visitors. That is fine for a free read-only key.

## Disclaimer
Educational project. Movie data and images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
