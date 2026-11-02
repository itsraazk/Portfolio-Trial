function checkPassword() {
    const correctPassword = "raaz123";
    const passwordInput = document.getElementById("password");
    const passwordScreen = document.getElementById("password-screen");
    const errorMessage = document.getElementById("error-message");

    if (passwordInput.value === correctPassword) {
        passwordScreen.style.display = "none";
        errorMessage.textContent = "";
    } else {
        errorMessage.textContent = "Access denied. Check your password and try again.";
        passwordInput.select();
    }
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
