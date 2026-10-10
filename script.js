/* ===== Config =====
   Get a free API key at https://www.themoviedb.org/settings/api and paste it below.
   With no key the app runs in demo mode using the sample data in DEMO. */
const API_KEY = "62156dc7b20a3463ac050ef95e4a2646";
const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/";

const ROWS = [
  ["Trending Now", "/trending/movie/week", ""],
  ["Top Rated", "/movie/top_rated", ""],
  ["Bollywood Hits", "/discover/movie", "&with_original_language=hi&sort_by=popularity.desc"],
  ["Action", "/discover/movie", "&with_genres=28"],
  ["Comedy", "/discover/movie", "&with_genres=35"],
  ["Horror", "/discover/movie", "&with_genres=27"],
  ["Romance", "/discover/movie", "&with_genres=10749"],
];

// Demo data (used when API_KEY is empty or the API is unreachable)
const DEMO = [
  { id: "d1", title: "3 Idiots", year: "2009", rating: "8.4", poster: "assets/3_idiots_poster.jpg", overview: "Two friends search for their long-lost companion and recall their college days with a rebellious free thinker who taught them to chase excellence, not grades." },
  { id: "d2", title: "Dangal", year: "2016", rating: "8.3", poster: "assets/dangal.jpg", overview: "A former wrestler trains his daughters to become world-class wrestlers, breaking barriers along the way." },
  { id: "d3", title: "Sample Movie One", year: "2020", rating: "7.5", overview: "Add your TMDB API key in script.js to load real movies, posters and trailers." },
  { id: "d4", title: "Sample Movie Two", year: "2021", rating: "7.1", overview: "Add your TMDB API key in script.js to load real movies, posters and trailers." },
  { id: "d5", title: "Sample Movie Three", year: "2022", rating: "6.9", overview: "Add your TMDB API key in script.js to load real movies, posters and trailers." },
  { id: "d6", title: "Sample Movie Four", year: "2023", rating: "7.8", overview: "Add your TMDB API key in script.js to load real movies, posters and trailers." },
];

/* ===== Helpers ===== */
const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const norm = (m) => ({
  id: m.id,
  title: m.title || m.name,
  overview: m.overview || "No description available.",
  poster: m.poster_path ? IMG + "w342" + m.poster_path : null,
  backdrop: m.backdrop_path ? IMG + "w1280" + m.backdrop_path : null,
  year: (m.release_date || "").slice(0, 4),
  rating: m.vote_average ? m.vote_average.toFixed(1) : "",
});

async function api(path, params = "") {
  const res = await fetch(`${API}${path}?api_key=${API_KEY}${params}`);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}
async function getMovies(path, params) {
  if (!API_KEY) return DEMO;
  try { return (await api(path, params)).results.filter((m) => m.poster_path).map(norm); }
  catch { return DEMO; }
}

/* ===== UI builders ===== */
function card(m) {
  const b = document.createElement("button");
  b.className = "card";
  b.title = m.title;
  if (m.poster) {
    const img = new Image();
    img.src = m.poster; img.alt = m.title; img.loading = "lazy";
    b.append(img);
  } else {
    const d = document.createElement("div");
    d.className = "ph"; d.textContent = m.title;
    b.append(d);
  }
  b.onclick = () => openModal(m);
  return b;
}
function row(title, list) {
  const s = document.createElement("section");
  s.className = "row";
  const h = document.createElement("h2");
  h.textContent = title;
  const t = document.createElement("div");
  t.className = "track";
  list.forEach((m) => t.append(card(m)));
  s.append(h, t);
  return s;
}

/* ===== Landing page ===== */
async function renderTrending() {
  const list = (await getMovies("/trending/movie/week", "")).slice(0, 10);
  const box = $("#trending");
  list.forEach((m, i) => {
    const w = document.createElement("div");
    w.className = "movie-rank";
    const n = document.createElement("span");
    n.textContent = i + 1;
    w.append(n, card(m));
    box.append(w);
  });
}
document.querySelectorAll(".faq-question").forEach((q) => {
  q.onclick = () => q.setAttribute("aria-expanded", q.parentElement.classList.toggle("open"));
});
$("#start").onsubmit = (e) => {
  e.preventDefault();
  $("#email").value = $("#startEmail").value;
  $("#auth").showModal();
};

/* ===== Sign in (demo only: email saved in localStorage, no real server, no password) ===== */
const user = () => store.get("user", null);
$("#authBtn").onclick = () => {
  if (user()) { store.set("user", null); route(); }
  else $("#auth").showModal();
};
$("#authForm").onsubmit = (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const err = (t) => ($("#authErr").textContent = t);
  if (!/^\S+@\S+\.\S+$/.test(email)) return err("Enter a valid email address.");
  err("");
  store.set("user", { email });
  $("#auth").close();
  route();
};
$("#auth").onclick = (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); };

function route() {
  const u = user();
  $("#landing").hidden = !!u;
  $("#browse").hidden = !u;
  $("#search").hidden = !u;
  $("#search").value = "";
  $("#authBtn").textContent = u ? "Sign Out" : "Sign In";
  scrollTo(0, 0);
  if (u) loadBrowse();
}

/* ===== Browse page ===== */
let cache = null, banner = null;
async function loadBrowse() {
  const box = $("#rows");
  box.className = ""; box.innerHTML = "";
  $("#banner").hidden = false;
  cache ||= await Promise.all(ROWS.map((r) => getMovies(r[1], r[2])));
  const mine = store.get("mylist", []);
  if (mine.length) box.append(row("My List", mine));
  cache.forEach((d, i) => box.append(row(ROWS[i][0], d)));
  if (!banner) banner = cache[0][Math.floor(Math.random() * Math.min(5, cache[0].length))];
  $("#banner").style.backgroundImage = banner.backdrop || banner.poster
    ? `url("${banner.backdrop || banner.poster}")` : "linear-gradient(160deg,#b20710,#221f1f)";
  $("#b-title").textContent = banner.title;
  $("#b-over").textContent = banner.overview;
}
$("#b-play").onclick = () => { openModal(banner); trailer(banner); };
$("#b-info").onclick = () => openModal(banner);

/* Search with debounce */
let timer;
$("#search").oninput = (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => runSearch(e.target.value.trim()), 400);
};
async function runSearch(q) {
  if (!q) return loadBrowse();
  let res;
  if (API_KEY) {
    res = await api("/search/movie", "&query=" + encodeURIComponent(q))
      .then((d) => d.results.filter((m) => m.poster_path).map(norm)).catch(() => []);
  } else res = DEMO.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));
  const box = $("#rows");
  box.className = "searching"; box.innerHTML = "";
  $("#banner").hidden = true;
  if (!res.length) { box.innerHTML = '<p class="empty">No results. Try a different title.</p>'; return; }
  const s = row(`Results for "${q}"`, res);
  s.querySelector(".track").classList.add("grid");
  box.append(s);
}

/* ===== Movie modal, trailer and My List ===== */
let current = null;
function listLabel() {
  const inList = store.get("mylist", []).some((x) => x.id === current.id);
  $("#m-list").textContent = inList ? "\u2713 In My List" : "+ My List";
}
function openModal(m) {
  current = m;
  $("#m-head").style.backgroundImage = m.backdrop || m.poster ? `url("${m.backdrop || m.poster}")` : "";
  $("#m-title").textContent = m.title;
  $("#m-meta").textContent = [m.rating && "\u2605 " + m.rating, m.year].filter(Boolean).join("  \u2022  ");
  $("#m-over").textContent = m.overview;
  $("#m-video").innerHTML = "";
  listLabel();
  $("#modal").showModal();
}
async function trailer(m) {
  const v = $("#m-video");
  if (!API_KEY) {
    window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(m.title + " official trailer"), "_blank", "noopener");
    return;
  }
  try {
    const t = (await api(`/movie/${m.id}/videos`)).results.find((x) => x.site === "YouTube" && x.type === "Trailer");
    v.innerHTML = t
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(t.key)}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      : '<p class="note">No trailer available for this title.</p>';
  } catch { v.innerHTML = '<p class="note">Could not load the trailer. Check your connection.</p>'; }
}
$("#m-play").onclick = () => trailer(current);
$("#m-list").onclick = () => {
  const l = store.get("mylist", []), i = l.findIndex((x) => x.id === current.id);
  i >= 0 ? l.splice(i, 1) : l.push(current);
  store.set("mylist", l);
  listLabel();
  if (!$("#browse").hidden && !$("#search").value) loadBrowse();
};
$("#m-close").onclick = () => $("#modal").close();
$("#modal").onclick = (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); };
$("#modal").addEventListener("close", () => ($("#m-video").innerHTML = "")); // stops playback

/* ===== Init ===== */
window.addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 40));
renderTrending();
route();
