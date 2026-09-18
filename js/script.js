// =========================
// LOADER
// =========================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "none";

    }

});
// =========================
// ADMIN SERVICES POPUP
// =========================
// =========================
// GALLERY LIGHTBOX
// =========================

const galleryImages = document.querySelectorAll(".gallery-item img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeLightbox = document.querySelector(".close-lightbox");

if (lightbox && lightboxImg) {

    galleryImages.forEach((image) => {

        image.addEventListener("click", () => {

            lightbox.style.display = "flex";
            lightboxImg.src = image.src;

        });

    });

}

if (closeLightbox) {
    closeLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
    });
}

if (lightbox) {

    lightbox.addEventListener("click", (e) => {

        if (e.target === lightbox) {

            lightbox.style.display = "none";

        }

    });

}
// =========================
// BOOKING FORM API
// =========================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const bookingData = {

            customer_name: document.getElementById("customerName").value,

            customer_mobile: document.getElementById("customerMobile").value,
            customer_email: document.getElementById("customerEmail").value,

            service: document.getElementById("customerService").value,

            booking_date: document.getElementById("bookingDate").value,

            booking_time: document.getElementById("bookingTime").value

        };

        try {

            const response = await fetch("http://localhost:5000/api/bookings", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookingData)

            });

            const result = await response.json();

            alert(result.message);

            bookingForm.reset();

        } catch (error) {

            console.error(error);

            alert("Server Connection Failed");

        }

    });

}

// =========================
// LOAD TIME SLOTS
// =========================

const bookingTime = document.getElementById("bookingTime");

if (bookingTime) {

    loadTimeSlots();

}

const bookingDate = document.getElementById("bookingDate");

if (bookingDate) {

    bookingDate.addEventListener("change", () => {

        loadTimeSlots();

    });

}

async function loadTimeSlots() {

    try {

        const selectedDate = document.getElementById("bookingDate").value;

const response = await fetch(
    `http://localhost:5000/api/time-slots?date=${selectedDate}`
);

        const slots = await response.json();

        bookingTime.innerHTML =
            '<option value="">Select Time Slot</option>';

        slots.forEach(slot => {

            bookingTime.innerHTML += `
                <option value="${slot.slot_time}">
                    ${slot.slot_time}
                </option>
            `;

        });

    } catch (error) {

        console.log(error);

    }

}

// =========================
// LOAD BOOKINGS FROM DATABASE
// =========================

const bookingTableBody = document.getElementById("bookingTableBody");

if (bookingTableBody) {

    fetch("http://localhost:5000/api/bookings")

        .then(response => response.json())

        .then(data => {

            bookingTableBody.innerHTML = "";

            data.forEach((booking) => {

                const formattedDate = new Date(booking.booking_date)
                    .toLocaleDateString("en-GB");

                bookingTableBody.innerHTML += `
                    <tr>

                        <td>${booking.customer_name}</td>

                        <td>${booking.customer_mobile}</td>

                        <td>${booking.service}</td>

                        <td>₹${booking.payment_amount}</td>

                        <td>
                            ${
                                booking.payment_status === "Paid"
                                ? '<span style="color:green;font-weight:bold;">🟢 Paid</span>'
                                : '<span style="color:orange;font-weight:bold;">🟡 Pending</span>'
                            }
                        </td>

                        <td>
                            ${booking.payment_id ? booking.payment_id : "-"}
                        </td>

                        <td>${formattedDate}</td>

                        <td>${booking.booking_time}</td>

                        <td>

                            <select class="status-select" data-id="${booking.id}">

                                <option value="Pending" ${booking.status === "Pending" ? "selected" : ""}>
                                    🟡 Pending
                                </option>

                                <option value="Confirmed" ${booking.status === "Confirmed" ? "selected" : ""}>
                                    🟢 Confirmed
                                </option>

                                <option value="Completed" ${booking.status === "Completed" ? "selected" : ""}>
                                    ✅ Completed
                                </option>

                                <option value="Cancelled" ${booking.status === "Cancelled" ? "selected" : ""}>
                                    🔴 Cancelled
                                </option>

                            </select>

                        </td>

                        <td>

                            <button class="delete-booking-btn" data-id="${booking.id}">
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

            });

        })

        .catch(error => {

            console.log("Error:", error);

        });

}
// =========================
// UPDATE BOOKING STATUS
// =========================

document.addEventListener("change", async (e) => {

    if (e.target.classList.contains("status-select")) {

        const id = e.target.dataset.id;
        const status = e.target.value;

        try {

            const response = await fetch(
                `http://localhost:5000/api/bookings/${id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status })
                }
            );

            const result = await response.json();

            alert(result.message);

        } catch (error) {

            console.log(error);

            alert("Status Update Failed");

        }

    }

});

// =========================
// DELETE BOOKING
// =========================

document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("delete-booking-btn")) {

        const id = e.target.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this booking?");

        if (!confirmDelete) return;

        try {

            const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {

                method: "DELETE"

            });

            const result = await response.json();

            alert(result.message);

            location.reload();

        } catch (error) {

            console.error(error);

            alert("Delete Failed");

        }

    }

});

// =========================
// DASHBOARD LIVE STATS
// =========================

const totalServices = document.getElementById("totalServices");
const totalBookings = document.getElementById("totalBookings");
const totalCustomers = document.getElementById("totalCustomers");
const totalRevenue = document.getElementById("totalRevenue");
const todayBookings = document.getElementById("todayBookings");


if (totalBookings) {

    fetch("http://localhost:5000/api/dashboard")

        .then(response => response.json())

        .then(data => {

            totalServices.textContent = data.totalServices;
            totalBookings.textContent = data.totalBookings;
            totalCustomers.textContent = data.totalCustomers;
            totalRevenue.textContent = "₹" + data.totalRevenue;
            todayBookings.textContent = data.todayBookings;

        })

        .catch(error => {

            console.log(error);

        });

}

// =========================
// LOGOUT
// =========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        if (confirm("Are you sure you want to logout?")) {

            localStorage.removeItem("adminLoggedIn");

            window.location.href = "../index.html";

        }

    });

}

// =========================
// SEARCH BOOKINGS
// =========================

const searchBooking = document.getElementById("searchBooking");

if (searchBooking) {

    searchBooking.addEventListener("keyup", () => {

        const value = searchBooking.value.toLowerCase();

        document.querySelectorAll("#bookingTableBody tr").forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(value)
                ? ""
                : "none";

        });

    });

}

// =========================
// DARK / LIGHT THEME
// =========================

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        themeToggle.innerHTML = "☀️";
    }

    themeToggle.addEventListener("click", () => {
        console.log("Theme button clicked");

        document.body.classList.toggle("light-theme");

        if (document.body.classList.contains("light-theme")) {

            localStorage.setItem("theme", "light");

            themeToggle.innerHTML = "☀️";

        } else {

            localStorage.setItem("theme", "dark");

            themeToggle.innerHTML = "🌙";

        }

    });

}
// =========================
// STATUS COLORS
// =========================

function updateStatusColor(select) {

    select.classList.remove(
        "status-pending",
        "status-confirmed",
        "status-cancelled"
    );

    if (select.value === "Pending") {

        select.classList.add("status-pending");

    } else if (select.value === "Confirmed") {

        select.classList.add("status-confirmed");

    } else if (select.value === "Cancelled") {

        select.classList.add("status-cancelled");

    }

}

document.querySelectorAll(".status-select").forEach(select => {

    updateStatusColor(select);

    select.addEventListener("change", () => {

        updateStatusColor(select);

    });

});

// =========================
// LOAD RECENT BOOKINGS
// =========================

async function loadRecentBookings() {

    const tableBody = document.getElementById("recentBookingsBody");

    if (!tableBody) return;

    try {

        const response = await fetch("http://localhost:5000/api/recent-bookings");
        const bookings = await response.json();

        if (bookings.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No Recent Bookings
                    </td>
                </tr>
            `;

            return;

        }

        tableBody.innerHTML = "";

        bookings.forEach(booking => {

            // Format Date
            const formattedDate = new Date(booking.booking_date)
                .toLocaleDateString("en-GB");

            let statusBadge = "";

            if (booking.status === "Confirmed") {

                statusBadge = `<span class="status-confirmed">🟢 Confirmed</span>`;

            } else if (booking.status === "Cancelled") {

                statusBadge = `<span class="status-cancelled">🔴 Cancelled</span>`;

            } else {

                statusBadge = `<span class="status-pending">🟡 Pending</span>`;

            }

            tableBody.innerHTML += `
                <tr>
                    <td>${booking.customer_name}</td>
                    <td>${booking.service}</td>
                    <td>${formattedDate}</td>
                    <td>${booking.booking_time}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;

        });

    } catch (error) {

        console.log("Error loading recent bookings:", error);

    }

}

// =========================
// AUTO SELECT SERVICE
// =========================

const serviceDropdown = document.getElementById("customerService");

if (serviceDropdown) {

    const params = new URLSearchParams(window.location.search);

    const service = params.get("service");

    if (service) {

        serviceDropdown.value = service;

    }

}
// =========================
// LOAD SERVICES FROM DATABASE
// =========================

const servicesContainer = document.getElementById("servicesContainer");

if (servicesContainer) {

    fetch("http://localhost:5000/api/services")

        .then(response => response.json())

        .then(services => {

            servicesContainer.innerHTML = "";

            services.forEach(service => {

                servicesContainer.innerHTML += `

                    <div class="service-card">

                        <img src="http://localhost:5000${service.service_image}" alt="${service.service_name}">

                        <div class="service-content">

                            <h2>${service.service_name}</h2>

                            <p>
                                Premium salon service by our expert stylists.
                            </p>

                            <p><strong>Duration:</strong> ${service.service_duration}</p>

                            <h3>₹${service.service_price}</h3>

                            <a href="booking.html?service=${encodeURIComponent(service.service_name)}"
                               class="book-btn">
                                Book Now
                            </a>

                        </div>

                    </div>

                `;

            });

        })

        .catch(error => {

            console.log("Services Error:", error);

        });

}

// =========================
// LOAD SERVICES ON HOME PAGE
// =========================

const homeServicesContainer = document.getElementById("homeServicesContainer");

if (homeServicesContainer) {

    fetch("http://localhost:5000/api/services")

        .then(response => response.json())

        .then(services => {

            homeServicesContainer.innerHTML = "";

            services.forEach(service => {

                homeServicesContainer.innerHTML += `
<div class="service-card">

    <img
        src="http://localhost:5000${service.service_image}"
        alt="${service.service_name}">

    <div class="service-content">

        <h2>${service.service_name}</h2>

        <p>
            Premium salon service by our expert stylists.
        </p>

        <p>
            <strong>Duration:</strong>
            ${service.service_duration}
        </p>

        <h3>
            ₹${service.service_price}
        </h3>

        <a
            href="booking.html?service=${encodeURIComponent(service.service_name)}"
            class="book-btn">

            Book Now

        </a>

    </div>

</div>
`;

            });

        })

        .catch(error => {
            console.log("Failed to load services:", error);
        });
    }
// =========================
// DASHBOARD DATA LOAD
// =========================

if (window.location.pathname.includes("dashboard.html")) {

    fetch("http://localhost:5000/api/dashboard")

        .then(res => res.json())

        .then(data => {

            document.getElementById("totalBookings").innerText =
                data.totalBookings || 0;

            document.getElementById("totalRevenue").innerText =
                "₹" + (data.totalRevenue || 0);

            document.getElementById("todayBookings").innerText =
                data.todayBookings || 0;

            document.getElementById("todayRevenue").innerText =
                "₹" + (data.todayRevenue || 0);

        })

        .catch(err => {
            console.log("Dashboard Error:", err);
        });

}
// =========================
// REVENUE CHART
// =========================

if (window.location.pathname.includes("dashboard.html")) {

    fetch("http://localhost:5000/api/bookings")

        .then(res => res.json())

        .then(data => {

            // Monthly revenue array
            const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            const revenueData = new Array(12).fill(0);

            data.forEach(b => {

                if (b.payment_status === "Paid") {

                    const month = new Date(b.booking_date).getMonth();

                    revenueData[month] += Number(b.payment_amount);

                }

            });

            const ctx = document.getElementById("revenueChart");

            new Chart(ctx, {

                type: "bar",

                data: {
                    labels: months,
                    datasets: [{
                        label: "Monthly Revenue (₹)",
                        data: revenueData
                    }]
                },

                options: {
                    responsive: true
                }

            });

        })

        .catch(err => {
            console.log("Chart Error:", err);
        });

}

console.log("Loading Recent Bookings...");
loadRecentBookings();