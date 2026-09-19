const registerForm = document.getElementById("userRegisterForm");

registerForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const password = document.getElementById("userPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {

        const response = await fetch("https://salon-booking-system-nsui.onrender.com/api/users/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                phone,
                password
            })
        });

        const data = await response.json();

        if (data.success) {

            alert("Account created successfully!");

            window.location.href = "login.html";

        } else {

            alert(data.message || "Registration failed!");

        }

    } catch (error) {

        console.error("Registration Error:", error);

        alert("Server connection failed!");

    }

});