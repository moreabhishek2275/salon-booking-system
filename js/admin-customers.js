// =========================
// LOAD CUSTOMERS
// =========================

const customersTableBody = document.getElementById("customersTableBody");

if (customersTableBody) {

    loadCustomers();

}

async function loadCustomers() {

    try {

        const response = await fetch("http://localhost:5000/api/customers");

        const customers = await response.json();

        customersTableBody.innerHTML = "";

        customers.forEach(customer => {

            customersTableBody.innerHTML += `
                <tr>
                    <td>${customer.customer_name}</td>
                    <td>${customer.customer_mobile}</td>
                    <td>${customer.service}</td>
                    <td>${customer.booking_date}</td>
                    <td>${customer.booking_time}</td>
                    <td>
                        <button class="delete-customer-btn"
                                data-id="${customer.id}">
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
// DELETE CUSTOMER
// =========================

document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("delete-customer-btn")) {

        const id = e.target.dataset.id;

        if (!confirm("Delete this customer?")) return;

        try {

            const response = await fetch(`http://localhost:5000/api/customers/${id}`, {

                method: "DELETE"

            });

            const result = await response.json();

            alert(result.message);

            loadCustomers();

        } catch (error) {

            console.log(error);

            alert("Delete Failed");

        }

    }

});

// =========================
// SEARCH CUSTOMER
// =========================

const searchCustomer = document.getElementById("searchCustomer");

if (searchCustomer) {

    searchCustomer.addEventListener("keyup", () => {

        const value = searchCustomer.value.toLowerCase();

        document.querySelectorAll("#customersTableBody tr").forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(value)
                ? ""
                : "none";

        });

    });

}