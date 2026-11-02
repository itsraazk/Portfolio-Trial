function checkPassword() {

    const correctPassword = "raaz123";

    const enteredPassword =
        document.getElementById("password").value;

    const passwordScreen =
        document.getElementById("password-screen");

    const errorMessage =
        document.getElementById("error-message");


    if (enteredPassword === correctPassword) {

        passwordScreen.style.display = "none";

    } else {

        errorMessage.textContent =
            "Wrong password. Try again ❤️";

    }
}

// Live clock for the RAAZ.EXE dashboard
function updateDashboardClock() {
    const clock = document.getElementById("dashboard-clock");
    const date = document.getElementById("dashboard-date");

    if (!clock || !date) return;

    const now = new Date();
    clock.textContent = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
    date.textContent = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

updateDashboardClock();
setInterval(updateDashboardClock, 1000);


// Personal notes are saved in this browser on this device.
const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");
const notesCount = document.getElementById("notes-count");
const NOTES_STORAGE_KEY = "raaz-exe-personal-notes";

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
        alert("Could not save this note. Browser storage may be full or disabled.");
        return false;
    }
}

function renderNotes() {
    if (!notesList || !notesCount) return;
    const notes = getSavedNotes();
    notesCount.textContent = String(notes.length).padStart(2, "0") + " SAVED";
    notesList.replaceChildren();

    if (notes.length === 0) {
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

        const actions = document.createElement("div");
        actions.className = "note-card-actions";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "note-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            const remaining = getSavedNotes().filter((item) => item.id !== note.id);
            if (saveNotes(remaining)) renderNotes();
        });

        actions.appendChild(deleteButton);
        card.append(title, content, meta, actions);
        notesList.appendChild(card);
    });
}

if (noteForm) {
    noteForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const titleInput = document.getElementById("note-title");
        const contentInput = document.getElementById("note-content");
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !content) return;

        const notes = getSavedNotes();
        notes.push({
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            title: title,
            content: content,
            createdAt: new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            })
        });

        if (saveNotes(notes)) {
            noteForm.reset();
            renderNotes();
        }
    });
    renderNotes();
}
