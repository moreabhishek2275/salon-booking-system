// =========================
// ADMIN LOGIN
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const loginData = {

            username: document.getElementById("username").value,

            password: document.getElementById("password").value

        };

        try {

            const response = await fetch("http://localhost:5000/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)

            });

            const result = await response.json();

            alert(result.message);

            if (result.success) {
                
                localStorage.setItem("adminLoggedIn", "true");
                window.location.href = "dashboard.html";

            }

        } catch (error) {

            console.log(error);

            alert("Server Connection Failed");

        }

    });

}