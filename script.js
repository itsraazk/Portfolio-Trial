function checkPassword() {
    const correctPassword = "raaz123";
    const passwordInput = document.getElementById("password");
    const passwordScreen = document.getElementById("password-screen");
    const errorMessage = document.getElementById("error-message");

    if (passwordInput.value === correctPassword) {
        sessionStorage.setItem("raaz-exe-unlocked", "true");
        passwordScreen.classList.add("is-unlocking");
        errorMessage.textContent = "";
        window.setTimeout(() => { passwordScreen.style.display = "none"; }, 460);
    } else {
        errorMessage.textContent = "Access denied. Check your password and try again.";
        passwordInput.select();
    }
}

// Keep access unlocked while the visitor navigates between pages in this tab.
const passwordScreen = document.getElementById("password-screen");
if (passwordScreen && sessionStorage.getItem("raaz-exe-unlocked") === "true") {
    passwordScreen.style.display = "none";
}

// Submit the login form with the keyboard Enter key or the button.
const passwordForm = document.getElementById("password-form");
if (passwordForm) {
    passwordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        checkPassword();
    });
}

// Live 12-hour clock for the RAAZ.EXE dashboard.
function updateDashboardClock() {
    const clock = document.getElementById("dashboard-clock");
    const date = document.getElementById("dashboard-date");
    if (!clock || !date) return;

    const now = new Date();
    clock.textContent = now.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });
    date.textContent = now.toLocaleDateString("en-IN", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
    });
}
updateDashboardClock();
setInterval(updateDashboardClock, 1000);

// Personal notes and optional media attachments.
// Notes are stored in this browser only. Keep attachments small to fit browser storage.
const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");
const notesCount = document.getElementById("notes-count");
const NOTES_STORAGE_KEY = "raaz-exe-personal-notes";
const MAX_MEDIA_SIZE = 1024 * 1024;

function getSavedNotes() {
    try {
        const saved = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function saveNotes(notes) {
    try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
        return true;
    } catch (error) {
        alert("Couldn't save this note. Try a smaller attachment or remove older media notes.");
        return false;
    }
}

function renderNotes() {
    if (!notesList || !notesCount) return;
    const notes = getSavedNotes();
    notesCount.textContent = String(notes.length).padStart(2, "0") + " SAVED";
    notesList.replaceChildren();

    if (!notes.length) {
        const empty = document.createElement("p");
        empty.className = "notes-empty";
        empty.textContent = "No notes yet. Your next idea can start here.";
        notesList.appendChild(empty);
        return;
    }

    notes.slice().reverse().forEach((note) => {
        const card = document.createElement("article");
        card.className = "note-card";
        const title = document.createElement("h4");
        title.textContent = note.title;
        const content = document.createElement("p");
        content.textContent = note.content;
        const meta = document.createElement("div");
        meta.className = "note-card-meta";
        meta.textContent = note.createdAt;
        card.append(title, content);

        if (note.media && note.media.dataUrl) {
            if (note.media.type.startsWith("image/")) {
                const media = document.createElement("img");
                media.src = note.media.dataUrl;
                media.alt = note.media.name || "Note attachment";
                media.className = "note-media-preview";
                card.appendChild(media);
            } else if (note.media.type.startsWith("video/")) {
                const media = document.createElement("video");
                media.src = note.media.dataUrl;
                media.controls = true;
                card.appendChild(media);
            } else if (note.media.type.startsWith("audio/")) {
                const media = document.createElement("audio");
                media.src = note.media.dataUrl;
                media.controls = true;
                card.appendChild(media);
            }
        }

        const actions = document.createElement("div");
        actions.className = "note-card-actions";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "note-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            const remaining = getSavedNotes().filter(item => item.id !== note.id);
            if (saveNotes(remaining)) renderNotes();
        });
        actions.appendChild(deleteButton);
        card.append(meta, actions);
        notesList.appendChild(card);
    });
}

if (noteForm) {
    noteForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const titleInput = document.getElementById("note-title");
        const contentInput = document.getElementById("note-content");
        const mediaInput = document.getElementById("note-media");
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const file = mediaInput && mediaInput.files ? mediaInput.files[0] : null;
        if (!title || !content) return;

        if (file && file.size > MAX_MEDIA_SIZE) {
            alert("Please choose a media file smaller than 1 MB.");
            return;
        }

        const createNote = (mediaData) => {
            const notes = getSavedNotes();
            notes.push({
                id: Date.now().toString() + Math.random().toString(16).slice(2),
                title,
                content,
                createdAt: new Date().toLocaleString("en-IN", {
                    dateStyle: "medium", timeStyle: "short"
                }),
                media: mediaData
            });
            if (saveNotes(notes)) {
                noteForm.reset();
                renderNotes();
            }
        };

        if (!file) {
            createNote(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => createNote({
            name: file.name,
            type: file.type || "application/octet-stream",
            dataUrl: reader.result
        });
        reader.onerror = () => alert("Couldn't read that media file. Please try another one.");
        reader.readAsDataURL(file);
    });
    renderNotes();
}


/* Dashboard micro-interactions */
(() => {
  const greeting = document.getElementById("dash-greeting");
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = hour < 12 ? "GOOD MORNING. WELCOME IN." : hour < 17 ? "GOOD AFTERNOON. WELCOME IN." : "GOOD EVENING. WELCOME IN.";
  }
  const tracks = {
    build: {title:"Web development",tag:"IN PRACTICE",description:"Building responsive pages and learning how HTML, CSS and JavaScript work together.",progress:"42%",label:"CURRENT TRACK · PRACTICE MODE"},
    learn: {title:"Programming fundamentals",tag:"STUDY MODE",description:"Strengthening C programming, logic, computer fundamentals and the basics that make good developers.",progress:"30%",label:"CURRENT TRACK · FOUNDATION MODE"},
    explore: {title:"Security & emerging tech",tag:"EXPLORING",description:"Getting familiar with cybersecurity, AI and the systems behind the technology we use every day.",progress:"18%",label:"CURRENT TRACK · CURIOSITY MODE"}
  };
  const buttons = document.querySelectorAll("[data-dash-tab]");
  buttons.forEach(button => button.addEventListener("click", () => {
    const track = tracks[button.dataset.dashTab];
    if (!track) return;
    buttons.forEach(item => { const active = item === button; item.classList.toggle("active",active); item.setAttribute("aria-selected",String(active)); });
    document.getElementById("dash-tab-title").textContent = track.title;
    document.getElementById("dash-tab-tag").textContent = track.tag;
    document.getElementById("dash-tab-description").textContent = track.description;
    document.getElementById("dash-progress-bar").style.width = track.progress;
    document.getElementById("dash-progress-label").textContent = track.label;
  }));
})();


/* Add lock-screen controls without changing the existing password form contract. */
(() => {
 const input=document.getElementById("password");
 const form=document.getElementById("password-form");
 const footer=document.querySelector("#password-screen .login-footer");
 if(input&&form&&!document.getElementById("toggle-password")){
   const wrap=document.createElement("div");wrap.className="lock-input-wrap";
   input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
   const toggle=document.createElement("button");toggle.type="button";toggle.id="toggle-password";toggle.className="password-toggle";toggle.setAttribute("aria-label","Show password");toggle.setAttribute("aria-pressed","false");toggle.innerHTML='<span class="show-label">SHOW</span><span class="hide-label">HIDE</span>';wrap.appendChild(toggle);
   toggle.addEventListener("click",()=>{const reveal=input.type==="password";input.type=reveal?"text":"password";toggle.setAttribute("aria-pressed",String(reveal));toggle.setAttribute("aria-label",reveal?"Hide password":"Show password");input.focus();});
 }
 if(footer&&!document.getElementById("lock-clock")){const clock=document.createElement("span");clock.id="lock-clock";footer.appendChild(clock);const update=()=>clock.textContent="LOCAL TIME · "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});update();window.setInterval(update,30000);}
})();

/* Gentle scroll reveals for dashboard and note cards. */
(() => {
 const items=document.querySelectorAll(".dash-panel,.dash-stat,.dash-info-strip,.dash-hero,.note-card");
 if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 items.forEach((item,index)=>{item.classList.add("motion-ready");item.style.setProperty("--motion-delay",Math.min(index%5,4)*60+"ms");});
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("motion-in");observer.unobserve(entry.target);}),{threshold:.08});
 items.forEach(item=>observer.observe(item));
})();


/* RAAZ.EXE command palette and bookmarks vault */
(() => {
  const palette = document.getElementById("command-palette");
  const search = document.getElementById("palette-search");
  const results = document.getElementById("palette-results");
  const bookmarkForm = document.getElementById("bookmark-form");
  const bookmarkList = document.getElementById("bookmarks-list");
  const bookmarkCount = document.getElementById("bookmark-count");
  const bookmarkSearch = document.getElementById("bookmark-search");
  const STORAGE_KEY = "raaz-exe-bookmarks";
  if (!palette || !results) return;

  const readBookmarks = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) { return []; }
  };
  const writeBookmarks = (items) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); return true; }
    catch (error) { alert("Your browser storage is full. Remove a few bookmarks and try again."); return false; }
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch (error) { return null; }
  };

  const renderBookmarks = () => {
    if (!bookmarkList || !bookmarkCount) return;
    const query = (bookmarkSearch?.value || "").trim().toLowerCase();
    const all = readBookmarks();
    const filtered = all.filter(item => [item.title, item.url, item.category].join(" ").toLowerCase().includes(query));
    bookmarkCount.textContent = String(all.length).padStart(2, "0") + " SAVED";
    bookmarkList.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "bookmarks-empty";
      empty.textContent = all.length ? "No bookmarks match that search." : "Your vault is waiting for its first link.";
      bookmarkList.appendChild(empty);
      return;
    }
    filtered.slice().reverse().forEach(item => {
      const card = document.createElement("article");
      card.className = "bookmark-card";
      const top = document.createElement("div");
      top.className = "bookmark-card-top";
      const category = document.createElement("span");
      category.className = "bookmark-category";
      category.textContent = item.category || "Other";
      top.appendChild(category);
      const title = document.createElement("h3");
      title.textContent = item.title;
      const link = document.createElement("a");
      link.className = "bookmark-url";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.url.replace(/^https?:\/\//, "");
      link.title = item.url;
      const actions = document.createElement("div");
      actions.className = "bookmark-card-actions";
      const open = document.createElement("a");
      open.className = "bookmark-open";
      open.href = item.url;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "OPEN LINK ↗";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "bookmark-delete";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        if (writeBookmarks(readBookmarks().filter(saved => saved.id !== item.id))) renderBookmarks();
      });
      actions.append(open, remove);
      card.append(top, title, link, actions);
      bookmarkList.appendChild(card);
    });
  };

  if (bookmarkForm) {
    bookmarkForm.addEventListener("submit", event => {
      event.preventDefault();
      const title = document.getElementById("bookmark-title").value.trim();
      const rawUrl = document.getElementById("bookmark-url").value.trim();
      const category = document.getElementById("bookmark-category").value;
      const url = safeUrl(rawUrl);
      if (!title || !url) { alert("Please enter a name and a valid http:// or https:// link."); return; }
      const items = readBookmarks();
      if (items.some(item => item.url === url)) { alert("That link is already in your vault."); return; }
      items.push({ id: Date.now().toString() + Math.random().toString(16).slice(2), title, url, category });
      if (writeBookmarks(items)) { bookmarkForm.reset(); renderBookmarks(); }
    });
  }
  bookmarkSearch?.addEventListener("input", renderBookmarks);
  renderBookmarks();

  const commands = [
    {title:"Dashboard",detail:"Return to the top of your workspace",type:"PAGE",icon:"⌂",url:"#dashboard"},
    {title:"Home / Introduction",detail:"Jump to your introduction",type:"PAGE",icon:"↗",url:"#home"},
    {title:"Personal Notes",detail:"Open your notes section",type:"PAGE",icon:"▤",url:"#notes"},
    {title:"Bookmarks Vault",detail:"Open your saved links",type:"PAGE",icon:"☆",url:"#bookmark-vault"},
    {title:"Explore Me",detail:"View profile, skills and projects",type:"PAGE",icon:"◎",url:"profile.html"},
    {title:"Gallery",detail:"Browse your collected moments",type:"PAGE",icon:"▧",url:"gallery.html"},
    {title:"Dumps",detail:"Open your digital dump space",type:"PAGE",icon:"⌁",url:"dumps.html"}
  ];
  let visibleCommands = [];
  let activeIndex = 0;
  let previousFocus = null;

  const closePalette = () => {
    palette.classList.remove("is-open");
    palette.setAttribute("aria-hidden", "true");
    document.body.classList.remove("palette-active");
    if (previousFocus?.focus) previousFocus.focus();
  };
  const openPalette = () => {
    previousFocus = document.activeElement;
    palette.classList.add("is-open");
    palette.setAttribute("aria-hidden", "false");
    document.body.classList.add("palette-active");
    search.value = "";
    renderCommands();
    search.focus();
  };
  const activate = (item) => {
    if (item.url) {
      if (/^(https?:)?\/\//i.test(item.url)) window.open(item.url, "_blank", "noopener");
      else window.location.href = item.url.startsWith("#") ? item.url : item.url;
    }
    closePalette();
  };
  const renderCommands = () => {
    const query = search.value.trim().toLowerCase();
    const saved = readBookmarks().map(item => ({title:item.title,detail:item.url,type:"BOOKMARK",icon:"☆",url:item.url}));
    visibleCommands = [...commands, ...saved].filter(item => (item.title + " " + item.detail + " " + item.type).toLowerCase().includes(query));
    activeIndex = Math.min(activeIndex, Math.max(0, visibleCommands.length - 1));
    results.replaceChildren();
    if (!visibleCommands.length) {
      const empty = document.createElement("p");
      empty.className = "palette-no-results";
      empty.textContent = "No matching pages or bookmarks.";
      results.appendChild(empty);
      return;
    }
    visibleCommands.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "palette-result" + (index === activeIndex ? " is-active" : "");
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(index === activeIndex));
      const icon = document.createElement("span");
      icon.className = "palette-result-icon";
      icon.textContent = item.icon;
      const copy = document.createElement("span");
      copy.className = "palette-result-copy";
      const title = document.createElement("strong");
      title.textContent = item.title;
      const detail = document.createElement("small");
      detail.textContent = item.detail;
      copy.append(title, detail);
      const type = document.createElement("span");
      type.className = "palette-result-type";
      type.textContent = item.type;
      button.append(icon, copy, type);
      button.addEventListener("click", () => activate(item));
      results.appendChild(button);
    });
  };
  search.addEventListener("input", () => { activeIndex = 0; renderCommands(); });
  search.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + visibleCommands.length) % visibleCommands.length;
      renderCommands();
    } else if (event.key === "Enter" && visibleCommands[activeIndex]) {
      event.preventDefault();
      activate(visibleCommands[activeIndex]);
    }
  });
  document.querySelectorAll("[data-open-palette]").forEach(button => button.addEventListener("click", openPalette));
  document.querySelectorAll("[data-close-palette]").forEach(button => button.addEventListener("click", closePalette));
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette.classList.contains("is-open")) closePalette(); else openPalette();
    } else if (event.key === "Escape" && palette.classList.contains("is-open")) closePalette();
  });
})();
