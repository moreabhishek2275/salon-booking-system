// =========================
// LOCAL STORAGE FUNCTIONS
// =========================

// Get all services from Local Storage
function getServices() {
    return JSON.parse(localStorage.getItem("services")) || [];
}

// Save all services to Local Storage
function saveServices(services) {
    localStorage.setItem("services", JSON.stringify(services));
}
// =========================
// IMAGE TO BASE64
// =========================

function convertImageToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = error => reject(error);

        reader.readAsDataURL(file);

    });

}