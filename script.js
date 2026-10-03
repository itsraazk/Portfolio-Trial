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