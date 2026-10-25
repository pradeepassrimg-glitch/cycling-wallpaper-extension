// ---------- Settings ----------
const SECONDS_PER_IMAGE = 5;    // how long each image stays
const FADE_SECONDS      = 2;     // crossfade length
const SHUFFLE           = false; // true = random order
const EXTENSIONS        = ["jpg", "jpeg", "png", "webp"];
const CLOCK_24H         = false; // true = 24-hour clock
const MAX_SHORTCUTS     = 10; // shortcut tiles; app launcher has a larger app list

// Edit this list to change the apps menu (name, link, tile colour)
const APPS = [
  { name: "Search", url: "https://www.google.com", color: "#4285f4" },
  { name: "Gmail", url: "https://mail.google.com", color: "#d93025" },
  { name: "Drive", url: "https://drive.google.com", color: "#1a73e8" },
  { name: "YouTube", url: "https://www.youtube.com", color: "#ea4335" },
  { name: "Maps", url: "https://maps.google.com", color: "#188038" },
  { name: "Photos", url: "https://photos.google.com", color: "#f29900" },
  { name: "Calendar", url: "https://calendar.google.com", color: "#4285f4" },
  { name: "Translate", url: "https://translate.google.com", color: "#1967d2" },
  { name: "News", url: "https://news.google.com", color: "#5f6368" },
  { name: "Docs", url: "https://docs.google.com", color: "#185abc" },
  { name: "Sheets", url: "https://sheets.google.com", color: "#188038" },
  { name: "Slides", url: "https://slides.google.com", color: "#f9ab00" },
  { name: "Meet", url: "https://meet.google.com", color: "#00897b" },
  { name: "Chat", url: "https://chat.google.com", color: "#0b8043" },
  { name: "Gemini", url: "https://gemini.google.com", color: "#4285f4" },
  { name: "Contacts", url: "https://contacts.google.com", color: "#4285f4" },
  { name: "Keep", url: "https://keep.google.com", color: "#fbbc04" },
  { name: "Tasks", url: "https://tasks.google.com", color: "#4285f4" },
  { name: "Earth", url: "https://earth.google.com", color: "#188038" },
  { name: "Shopping", url: "https://shopping.google.com", color: "#4285f4" },
  { name: "Play", url: "https://play.google.com", color: "#01875f" },
  { name: "Blogger", url: "https://www.blogger.com", color: "#f57d00" },
  { name: "Classroom", url: "https://classroom.google.com", color: "#188038" },
  { name: "Admin", url: "https://admin.google.com", color: "#4285f4" },
  { name: "Account", url: "https://myaccount.google.com", color: "#4285f4" },
];

const DEFAULT_SHORTCUTS = [
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Gmail",   url: "https://mail.google.com" },
  { name: "Maps",    url: "https://maps.google.com" },
  { name: "Drive",   url: "https://drive.google.com" },
];
// ------------------------------

/* =====================  Wallpaper  ===================== */
// Images live in the images/ folder, named 1.jpg, 2.jpg, 3.png ...
// Any mix of sizes (1080p to 4K and beyond) and formats works. No compression is applied.

const layers = [document.getElementById("a"), document.getElementById("b")];
layers.forEach(l => l.style.transition = `opacity ${FADE_SECONDS}s ease`);

function canLoad(url) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = url;
  });
}

async function findImages() {
  const found = [];
  for (let i = 1; i < 500; i++) {
    let hit = null;
    for (const ext of EXTENSIONS) {
      const url = `images/${i}.${ext}`;
      if (await canLoad(url)) { hit = url; break; }
    }
    if (!hit) break;
    found.push(hit);
  }
  return found;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

(async function startWallpaper() {
  let images = await findImages();
  const customWallpapers = getCustomWallpapers();
  images = images.concat(customWallpapers);
  if (!images.length) {
    const msg = document.getElementById("msg");
    msg.style.display = "block";
    msg.textContent =
      "No wallpapers found. Use “Customize this page” to add images, or add files named 1.jpg, 2.jpg, 3.png to the images folder.";
    return;
  }
  if (SHUFFLE) images = shuffle(images);

  let index = 0, front = 0;
  function show(i) {
    const next = layers[1 - front], prev = layers[front];
    next.style.backgroundImage = `url("${images[i]}")`;
    next.classList.add("show");
    prev.classList.remove("show");
    front = 1 - front;
  }

  show(index);
  if (images.length > 1) {
    setInterval(() => {
      index = (index + 1) % images.length;
      // preload so the fade never shows a half-loaded 4K image
      const pre = new Image();
      pre.onload = pre.onerror = () => show(index);
      pre.src = images[index];
    }, SECONDS_PER_IMAGE * 1000);
  }
})();

/* =====================  Profile image  ===================== */
const accountBtn = document.getElementById("account");
const profilePicker = document.getElementById("profilePicker");
const profileImage = document.getElementById("profileImage");
const profileDefault = document.getElementById("profileDefault");

function loadProfileImage() {
  const saved = localStorage.getItem("profileImageData");
  if (saved) {
    profileImage.src = saved;
    profileImage.hidden = false;
    profileDefault.hidden = true;
  }
}
accountBtn.addEventListener("click", () => profilePicker.click());
profilePicker.addEventListener("change", () => {
  const file = profilePicker.files && profilePicker.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { localStorage.setItem("profileImageData", reader.result); } catch (e) {
      showMessage("That image is too large. Please choose a smaller image.");
      return;
    }
    loadProfileImage();
  };
  reader.readAsDataURL(file);
});
loadProfileImage();

/* =====================  Customize page / added wallpapers  ===================== */
const customizeBtn = document.getElementById("customizeBtn");
const customizeDlg = document.getElementById("customizeDlg");
const wallpaperPicker = document.getElementById("wallpaperPicker");
const customizeClose = document.getElementById("customizeClose");
const clearCustomWallpapers = document.getElementById("clearCustomWallpapers");

function getCustomWallpapers() {
  try { return JSON.parse(localStorage.getItem("customWallpapers") || "[]"); }
  catch (e) { return []; }
}
function showMessage(message) {
  const msg = document.getElementById("msg");
  msg.textContent = message;
  msg.style.display = "block";
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => { msg.style.display = "none"; }, 3500);
}
customizeBtn.addEventListener("click", () => customizeDlg.showModal());
customizeClose.addEventListener("click", () => customizeDlg.close());
wallpaperPicker.addEventListener("change", async () => {
  const files = Array.from(wallpaperPicker.files || []).filter(f => f.type.startsWith("image/"));
  if (!files.length) return;
  const existing = getCustomWallpapers();
  try {
    for (const file of files) {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      existing.push(data);
    }
    localStorage.setItem("customWallpapers", JSON.stringify(existing));
    showMessage("Added " + files.length + " wallpaper image(s). They will join the rotation after reload.");
  } catch (e) {
    showMessage("Could not save those images. Try fewer or smaller files.");
  }
  wallpaperPicker.value = "";
});
clearCustomWallpapers.addEventListener("click", () => {
  localStorage.removeItem("customWallpapers");
  showMessage("Added wallpapers cleared. Reload the tab to apply.");
});

/* =====================  Search  ===================== */
/* =====================  Search  ===================== */
const form = document.getElementById("searchForm");
const q = document.getElementById("q");

function looksLikeUrl(text) {
  if (/\s/.test(text)) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return true;
  return /^(localhost|[\w-]+(\.[\w-]+)+)(:\d+)?(\/\S*)?$/i.test(text);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = q.value.trim();
  if (!text) return;
  if (looksLikeUrl(text)) {
    location.href = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : "https://" + text;
    return;
  }
  // Uses whatever search engine your Chrome is set to
  if (typeof chrome !== "undefined" && chrome.search && chrome.search.query) {
    chrome.search.query({ text, disposition: "CURRENT_TAB" });
  } else {
    location.href = "https://www.google.com/search?q=" + encodeURIComponent(text);
  }
});

/* =====================  Apps menu  ===================== */
const appsBtn  = document.getElementById("appsBtn");
const appsMenu = document.getElementById("appsMenu");
const appsGrid = document.getElementById("appsGrid");

APPS.forEach(app => {
  const a = document.createElement("a");
  a.className = "app";
  a.href = app.url;
  const dot = document.createElement("div");
  dot.className = "dot app-logo";
  const logo = document.createElement("img");
  logo.alt = "";
  logo.width = 32;
  logo.height = 32;
  try {
    const domain = new URL(app.url).hostname;
    logo.src = "https://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(app.url) + "&sz=128";
  } catch (e) { dot.textContent = app.name[0]; }
  logo.onerror = () => { logo.remove(); dot.textContent = app.name[0]; };
  dot.appendChild(logo);
  const label = document.createElement("span");
  label.textContent = app.name;
  a.append(dot, label);
  appsGrid.appendChild(a);
});

function setApps(open) {
  appsMenu.hidden = !open;
  appsBtn.setAttribute("aria-expanded", String(open));
}
appsBtn.addEventListener("click", e => {
  e.stopPropagation();
  setApps(appsMenu.hidden);
});
document.addEventListener("click", e => {
  if (!appsMenu.hidden && !appsMenu.contains(e.target)) setApps(false);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") setApps(false);
});

/* =====================  Shortcuts  ===================== */
const shortcutsEl = document.getElementById("shortcuts");
const dlg         = document.getElementById("dlg");
const dlgForm     = document.getElementById("dlgForm");
const dlgTitle    = document.getElementById("dlgTitle");
const dlgName     = document.getElementById("dlgName");
const dlgUrl      = document.getElementById("dlgUrl");
const dlgRemove   = document.getElementById("dlgRemove");
const dlgCancel   = document.getElementById("dlgCancel");

let shortcuts = loadShortcuts();
let editingIndex = -1; // -1 = adding

function loadShortcuts() {
  try {
    const raw = localStorage.getItem("shortcuts");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return DEFAULT_SHORTCUTS.slice();
}
function saveShortcuts() {
  try { localStorage.setItem("shortcuts", JSON.stringify(shortcuts)); } catch (e) {}
}

function normalizeUrl(u) {
  u = u.trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = "https://" + u;
  return u;
}

function faviconFor(pageUrl) {
  try {
    const u = new URL(chrome.runtime.getURL("/_favicon/"));
    u.searchParams.set("pageUrl", pageUrl);
    u.searchParams.set("size", "64");
    return u.toString();
  } catch (e) {
    return "";
  }
}

function renderShortcuts() {
  shortcutsEl.textContent = "";

  shortcuts.forEach((s, i) => {
    const a = document.createElement("a");
    a.className = "tile";
    a.href = s.url;

    const fav = document.createElement("div");
    fav.className = "fav";
    const img = document.createElement("img");
    img.alt = "";
    img.src = faviconFor(s.url);
    fav.appendChild(img);

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = s.name;

    const more = document.createElement("button");
    more.className = "more";
    more.type = "button";
    more.title = "Edit shortcut";
    more.textContent = "⋮";
    more.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      openDialog(i);
    });

    a.append(fav, name, more);
    shortcutsEl.appendChild(a);
  });

  if (shortcuts.length < MAX_SHORTCUTS) {
    const add = document.createElement("button");
    add.className = "tile";
    add.type = "button";
    const fav = document.createElement("div");
    fav.className = "fav";
    const plus = document.createElement("span");
    plus.className = "plus";
    plus.textContent = "+";
    fav.appendChild(plus);
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = "Add shortcut";
    add.append(fav, name);
    add.addEventListener("click", () => openDialog(-1));
    shortcutsEl.appendChild(add);
  }
}

function openDialog(index) {
  editingIndex = index;
  if (index >= 0) {
    dlgTitle.textContent = "Edit shortcut";
    dlgName.value = shortcuts[index].name;
    dlgUrl.value = shortcuts[index].url;
    dlgRemove.style.display = "";
  } else {
    dlgTitle.textContent = "Add shortcut";
    dlgName.value = "";
    dlgUrl.value = "";
    dlgRemove.style.display = "none";
  }
  dlg.showModal();
  dlgName.focus();
}

dlgForm.addEventListener("submit", e => {
  e.preventDefault();
  const entry = { name: dlgName.value.trim(), url: normalizeUrl(dlgUrl.value) };
  if (!entry.name || !dlgUrl.value.trim()) return;
  if (editingIndex >= 0) shortcuts[editingIndex] = entry;
  else shortcuts.push(entry);
  saveShortcuts();
  renderShortcuts();
  dlg.close();
});
dlgCancel.addEventListener("click", () => dlg.close());
dlgRemove.addEventListener("click", () => {
  if (editingIndex >= 0) {
    shortcuts.splice(editingIndex, 1);
    saveShortcuts();
    renderShortcuts();
  }
  dlg.close();
});

renderShortcuts();
