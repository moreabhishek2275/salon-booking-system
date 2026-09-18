const loginForm = document.getElementById("userLoginForm");

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value;

    try {

        const response = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("salonhubUser", JSON.stringify(data.user));

            alert("Login successful!");

            // पुढच्या step मध्ये User Dashboard बनवू
            window.location.href = "dashboard.html";

        } else {

            alert(data.message || "Invalid email or password!");

        }

    } catch (error) {

        console.error("Login Error:", error);

        alert("Server connection failed!");

    }

});