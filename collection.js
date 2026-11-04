(() => {
    const type = document.body.dataset.collection;
    if (!type) return;
    const STORAGE_KEY = "raaz-exe-" + type + "-v1";
    const form = document.getElementById("collection-form");
    const modal = document.getElementById("editor-modal");
    const error = document.getElementById("collection-error");
    const search = document.getElementById("collection-search");
    const count = document.getElementById("item-count");
    const grid = document.getElementById(type === "gallery" ? "gallery-grid" : "dumps-grid");
    let filter = "all";
    const readItems = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } };
    const saveItems = items => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); return true; } catch { error.textContent = "Browser storage is full. Remove a few large files and try again."; return false; } };
    const escapeHTML = value => String(value || "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
    const formatDate = value => { const date=new Date(value); return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"}); };
    const safeDataUrl = (value, mode) => { if(typeof value!=="string"||!value.startsWith("data:")||!value.includes(";base64,"))return ""; const mime=value.slice(5,value.indexOf(";")); if(mode==="image")return mime.startsWith("image/")&&mime!=="image/svg+xml"?value:""; if(/^(text\/html|application\/xhtml\+xml|image\/svg\+xml)$/i.test(mime))return ""; return value; };
    const openModal = () => { modal.classList.add("visible"); modal.setAttribute("aria-hidden","false"); };
    const closeModal = () => { modal.classList.remove("visible"); modal.setAttribute("aria-hidden","true"); };
    document.getElementById("open-editor").addEventListener("click", openModal);
    document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", closeModal));
    modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") { closeModal(); closeLightbox(); } });

    function render() {
        const items = readItems();
        const query = (search.value || "").trim().toLowerCase();
        const visible = items.filter(item => {
            const matchesQuery = (item.title + " " + (item.body || "") + " " + (item.caption || "") + " " + (item.category || "")).toLowerCase().includes(query);
            const matchesFilter = filter === "all" || (filter === "text" ? !item.file : Boolean(item.file));
            return matchesQuery && matchesFilter;
        }).sort((a,b) => b.createdAt - a.createdAt);
        count.textContent = String(items.length).padStart(2,"0");
        if (!visible.length) {
            grid.innerHTML = '<div class="collection-empty"><span>' + (type === "gallery" ? "▧" : "⌁") + '</span><h3>' + (items.length ? "No matches found." : (type === "gallery" ? "Your gallery starts here." : "Nothing dumped. Yet.")) + '</h3><p>' + (items.length ? "Try another search." : "Add something and make this space yours.") + '</p></div>';
            return;
        }
        if (type === "gallery") {
            grid.innerHTML = visible.map(item => { const data=safeDataUrl(item.data,"image"); return '<article class="gallery-card"><button class="gallery-image" data-view="' + escapeHTML(item.id) + '" aria-label="View ' + escapeHTML(item.title) + '"' + (data ? "" : " disabled") + '>' + (data ? '<img src="' + escapeHTML(data) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">' : '<span class="gallery-image-unavailable">Image unavailable</span>') + '<span class="gallery-zoom">↗ VIEW</span></button><div class="gallery-card-caption"><div><h3>' + escapeHTML(item.title) + '</h3><p>' + escapeHTML(item.caption || "A moment worth keeping.") + '</p><small>' + formatDate(item.createdAt) + '</small></div><button class="item-delete" data-delete="' + escapeHTML(item.id) + '" aria-label="Delete photo">×</button></div></article>'; }).join("");
        } else {
            grid.innerHTML = visible.map(item => { const data=item.file ? safeDataUrl(item.file.data,"file") : ""; return '<article class="dump-card"><div class="dump-card-top"><span class="dump-category">' + escapeHTML(item.category || "random") + '</span><span class="dump-date">' + formatDate(item.createdAt) + '</span></div><h3>' + escapeHTML(item.title) + '</h3>' + (item.body ? '<p class="dump-body">' + escapeHTML(item.body).replace(/\\n/g,"<br>") + '</p>' : '') + (data ? '<a class="dump-attachment" href="' + escapeHTML(data) + '" download="' + escapeHTML(item.file.name) + '">↳ ' + escapeHTML(item.file.name) + ' <span>DOWNLOAD</span></a>' : (item.file ? '<span class="dump-attachment-unavailable">Attachment unavailable</span>' : '')) + '<div class="dump-card-bottom"><span>RAAZ / PRIVATE DROP</span><button class="item-delete" data-delete="' + escapeHTML(item.id) + '" aria-label="Delete dump">DELETE ×</button></div></article>'; }).join("");
        }
        grid.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
            if (!confirm("Delete this item from this browser?")) return;
            saveItems(readItems().filter(item => item.id !== button.dataset.delete)); render();
        }));
        if (type === "gallery") grid.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
            const item = readItems().find(entry => entry.id === button.dataset.view); if (!item) return;
            const imageData=safeDataUrl(item.data,"image"); if(!imageData)return;
            document.getElementById("lightbox-image").src = imageData;
            document.getElementById("lightbox-image").alt = item.title;
            document.getElementById("lightbox-caption").textContent = item.title + (item.caption ? " — " + item.caption : "");
            document.getElementById("lightbox").classList.add("visible");
            document.getElementById("lightbox").setAttribute("aria-hidden","false");
        }));
    }
    function closeLightbox() {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;
        lightbox.classList.remove("visible"); lightbox.setAttribute("aria-hidden","true");
        document.getElementById("lightbox-image").src = "";
    }
    document.querySelectorAll("[data-lightbox-close]").forEach(button => button.addEventListener("click", closeLightbox));
    const filters = document.querySelectorAll("[data-filter]");
    filters.forEach(button => button.addEventListener("click", () => {
        filters.forEach(item => item.classList.remove("active")); button.classList.add("active");
        filter = button.dataset.filter; render();
    }));
    search.addEventListener("input", render);

    form.addEventListener("submit", async event => {
        event.preventDefault(); error.textContent = "";
        const data = new FormData(form);
        const fileInput = form.elements.media;
        const files = fileInput ? Array.from(fileInput.files || []) : [];
        const max = type === "gallery" ? 1.5 * 1024 * 1024 : 2 * 1024 * 1024;
        if (type === "gallery" && !files.length) { error.textContent = "Choose at least one image."; return; }
        if (files.some(file => file.size > max)) { error.textContent = "One of the selected files is too large. Please choose smaller files."; return; }
        if (type === "gallery" && files.some(file => !file.type.startsWith("image/"))) { error.textContent = "Gallery accepts image files only."; return; }
        if (type === "dumps" && !String(data.get("body") || "").trim() && !files.length) { error.textContent = "Add some text or attach a file first."; return; }
        const toData = file => new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        try {
            const existing = readItems();
            const title = String(data.get("title") || "").trim();
            const additions = type === "gallery" ? await Promise.all(files.map(async (file,index) => ({
                id: Date.now().toString(36) + "-" + index + "-" + Math.random().toString(36).slice(2,7),
                title: files.length > 1 ? title + " " + (index + 1) : title,
                caption: String(data.get("caption") || "").trim(),
                data: await toData(file), createdAt: Date.now()
            }))) : [{
                id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7),
                title, body: String(data.get("body") || "").trim(),
                category: String(data.get("category") || "random"),
                file: files[0] ? {name:files[0].name,data:await toData(files[0])} : null,
                createdAt: Date.now()
            }];
            if (saveItems(existing.concat(additions))) { form.reset(); closeModal(); render(); }
        } catch { error.textContent = "Could not read that file. Please try another one."; }
    });
    render();
})();