// =========================
// ADMIN SERVICES
// =========================

const servicePopup = document.getElementById("servicePopup");
const addServiceBtn = document.querySelector(".add-service-btn");
const cancelBtn = document.getElementById("cancelBtn");
let editingServiceId = null;

if (addServiceBtn) {

    addServiceBtn.addEventListener("click", () => {

        servicePopup.style.display = "flex";

    });

}

if (cancelBtn) {

    cancelBtn.addEventListener("click", () => {

        servicePopup.style.display = "none";

    });

}

// =========================
// ADD / UPDATE SERVICE
// =========================

const serviceForm = document.getElementById("serviceForm");

if (serviceForm) {

    serviceForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const imageFile = document.getElementById("serviceImage").files[0];

let imagePath = "images/haircut.png";

if (imageFile) {

    const formData = new FormData();

    formData.append("image", imageFile);

    const uploadResponse = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData
    });

    const uploadResult = await uploadResponse.json();

    if (uploadResult.success) {
        imagePath = uploadResult.imagePath;
    }

}

        const serviceData = {

            service_name: document.getElementById("serviceName").value,
            service_price: document.getElementById("servicePrice").value,
            service_duration: document.getElementById("serviceDuration").value,
            service_image: imagePath

        };

        try {

            let response;

            if (editingServiceId) {

                // UPDATE SERVICE
                response = await fetch(`http://localhost:3000/api/services/${editingServiceId}`, {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(serviceData)

                });

            } else {

                // ADD NEW SERVICE
                response = await fetch("http://localhost:3000/api/services", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(serviceData)

                });

            }

            const result = await response.json();

            alert(result.message);

            editingServiceId = null;

            serviceForm.reset();

            servicePopup.style.display = "none";

            loadServices();

        } catch (error) {

            console.log(error);

            alert("Failed to Save Service");

        }

    });

}
// =========================
// LOAD SERVICES
// =========================

const servicesTableBody = document.getElementById("servicesTableBody");

if (servicesTableBody) {

    loadServices();

}

async function loadServices() {

    try {

        const response = await fetch("http://localhost:3000/api/services");

        const services = await response.json();

        servicesTableBody.innerHTML = "";

        services.forEach(service => {

            servicesTableBody.innerHTML += `
                <tr>
                    <td>
                        <img src="${service.service_image}" width="70">
                    </td>
                    <td>${service.service_name}</td>
                    <td>₹${service.service_price}</td>
                    <td>${service.service_duration}</td>
                    <td>
                        <button class="edit-btn" data-id="${service.id}">
    Edit
</button>
                        <button class="delete-btn" data-id="${service.id}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;

        });

    } catch (error) {

        console.log(error);

    }

}

// =========================
// DELETE SERVICE
// =========================

document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("delete-btn")) {

        const id = e.target.dataset.id;

        if (!confirm("Delete this service?")) return;

        try {

            const response = await fetch(`http://localhost:3000/api/services/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            alert(result.message);

            loadServices();

        } catch (error) {

            console.log(error);

            alert("Delete Failed");

        }

    }

});

// =========================
// EDIT SERVICE
// =========================

document.addEventListener("click", (e) => {

    if (e.target.classList.contains("edit-btn")) {

        editingServiceId = e.target.dataset.id;

        const row = e.target.closest("tr");

        document.getElementById("serviceName").value = row.cells[1].textContent;

        document.getElementById("servicePrice").value =
            row.cells[2].textContent.replace("₹", "");

        document.getElementById("serviceDuration").value =
            row.cells[3].textContent;

        servicePopup.style.display = "flex";

    }

});