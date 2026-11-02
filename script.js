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
