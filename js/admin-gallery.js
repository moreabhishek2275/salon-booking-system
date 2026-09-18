// =========================
// LOAD GALLERY
// =========================

const galleryTableBody = document.getElementById("galleryTableBody");

if (galleryTableBody) {

    loadGallery();

}

async function loadGallery() {

    try {

        const response = await fetch("http://localhost:5000/api/gallery");

        const images = await response.json();

        galleryTableBody.innerHTML = "";

        images.forEach(image => {

            galleryTableBody.innerHTML += `
                <tr>
                    <td>
                        <img src="../${image.image}" width="120">
                    </td>

                    <td>
                        <button class="delete-gallery-btn"
                                data-id="${image.id}">
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
// GALLERY POPUP
// =========================

const galleryPopup = document.getElementById("galleryPopup");
const addGalleryBtn = document.querySelector(".add-gallery-btn");
const cancelGalleryBtn = document.getElementById("cancelGalleryBtn");

if (addGalleryBtn) {

    addGalleryBtn.addEventListener("click", () => {

        galleryPopup.style.display = "flex";

    });

}

if (cancelGalleryBtn) {

    cancelGalleryBtn.addEventListener("click", () => {

        galleryPopup.style.display = "none";

    });

}

// =========================
// ADD GALLERY IMAGE
// =========================

const galleryForm = document.getElementById("galleryForm");

if (galleryForm) {

    galleryForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const imageFile = document.getElementById("galleryImage").files[0];
        const category = document.getElementById("galleryCategory").value;

        if (!imageFile) {
    alert("Please select an image");
    return;
}

        try {

          const formData = new FormData();
formData.append("image", imageFile);

const response = await fetch("http://localhost:5000/api/upload", {
    method: "POST",
    body: formData
});

const uploadResult = await response.json();

if (!uploadResult.success) {
    alert("Image Upload Failed");
    return;
}

const imagePath = uploadResult.imagePath;

 const galleryResponse = await fetch("http://localhost:5000/api/gallery", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
   body: JSON.stringify({
    image: imagePath,
    category: category
})
});

if (!galleryResponse.ok) {
    alert("Gallery Save Failed");
    return;
}         

            

            galleryForm.reset();

            galleryPopup.style.display = "none";

            loadGallery();

        } catch (error) {

            console.log(error);

            alert("Image Upload Failed");

        }

    });

}