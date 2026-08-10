// =========================
// LOAD SETTINGS
// =========================

const settingsForm = document.getElementById("settingsForm");

if (settingsForm) {

    loadSettings();

}

async function loadSettings() {

    try {

        const response = await fetch("http://localhost:3000/api/settings");

        const data = await response.json();

        document.getElementById("salonName").value = data.salon_name;
        document.getElementById("salonPhone").value = data.salon_phone;
        document.getElementById("salonEmail").value = data.salon_email;
        document.getElementById("salonAddress").value = data.salon_address;

    } catch (error) {

        console.log(error);

    }

}

// =========================
// UPDATE SETTINGS
// =========================

if (settingsForm) {

    settingsForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const settingsData = {

            salon_name: document.getElementById("salonName").value,
            salon_phone: document.getElementById("salonPhone").value,
            salon_email: document.getElementById("salonEmail").value,
            salon_address: document.getElementById("salonAddress").value

        };

        try {

            const response = await fetch("http://localhost:3000/api/settings", {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(settingsData)

            });

            const result = await response.json();

            alert(result.message);

        } catch (error) {

            console.log(error);

            alert("Settings Update Failed");

        }

    });

}