require("dotenv").config();

const Razorpay = require("razorpay");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const db = require("./db");



const {
    sendBookingEmail,
    sendConfirmationEmail,
    sendCompletedEmail
} = require("./email");

const sendPaymentSuccessEmail = require("./paymentEmail");

const multer = require("multer");
const path = require("path");

// Razorpay Instance
const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});

const app = express();

// =========================
// IMAGE UPLOAD CONFIG
// =========================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {
    res.send("SalonHub Backend is Running 🚀");
});

// =========================
// CREATE BOOKING API
// =========================

app.post("/api/bookings", (req, res) => {

    const {
        customer_name,
        customer_mobile,
        customer_email,
        service,
        booking_date,
        booking_time
    } = req.body;

    const getPriceSql = `
    SELECT service_price
    FROM services
    WHERE service_name = ?
`;

db.query(getPriceSql, [service], (err, serviceResult) => {

    if (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Service Price Error"
        });

    }

    if (serviceResult.length === 0) {

        return res.status(404).json({
            success: false,
            message: "Service Not Found"
        });

    }

    const payment_amount = serviceResult[0].service_price;

    const sql = `
        INSERT INTO bookings
        (
            customer_name,
            customer_mobile,
            customer_email,
            service,
            booking_date,
            booking_time,
            payment_amount,
            payment_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            customer_name,
            customer_mobile,
            customer_email,
            service,
            booking_date,
            booking_time,
            payment_amount,
            "Pending"
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Booking Failed"
                });

            }

            sendBookingEmail(customer_email, {
                customer_name,
                service,
                booking_date,
                booking_time
            });

            res.json({
                success: true,
                message: "Booking Saved Successfully"
            });

        }
    );

});

});
// =========================
// GET ALL BOOKINGS
// =========================

app.get("/api/bookings", (req, res) => {

    const sql = "SELECT * FROM bookings ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Failed to fetch bookings"
            });

        }

        res.json(results);

    });

});
// =========================
// UPDATE BOOKING STATUS
// =========================

app.put("/api/bookings/:id/status", (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const sql = `
        UPDATE bookings
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Status Update Failed"
            });
        }

        // Send Confirmation Email
        if (status === "Confirmed") {

            const getBookingSql = `
                SELECT *
                FROM bookings
                WHERE id = ?
            `;

            db.query(getBookingSql, [id], async (err, result) => {

                if (!err && result.length > 0) {

                    const booking = result[0];

                    await sendConfirmationEmail(
                        booking.customer_email,
                        booking
                    );

                }

            });

        }

        // Send Thank You Email
        if (status === "Completed") {

            const getBookingSql = `
                SELECT *
                FROM bookings
                WHERE id = ?
            `;

            db.query(getBookingSql, [id], async (err, result) => {

                if (!err && result.length > 0) {

                    const booking = result[0];

                    await sendCompletedEmail(
                        booking.customer_email,
                        booking
                    );

                }

            });

        }

        res.json({
            success: true,
            message: "Status Updated Successfully"
        });

    });

});
// =========================
// DELETE BOOKING API
// =========================

app.delete("/api/bookings/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM bookings WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Delete Failed"
            });

        }

        res.json({
            success: true,
            message: "Booking Deleted Successfully"
        });

    });

});

// =========================
// UPLOAD IMAGE API
// =========================

app.post("/api/upload", upload.single("image"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image selected"
        });
    }

    res.json({
        success: true,
        imagePath: `/uploads/${req.file.filename}`
    });

});

// =========================
// GET ALL SERVICES API
// =========================

app.get("/api/services", (req, res) => {

    const sql = "SELECT * FROM services ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch services"
            });

        }

        res.json(results);

    });

});
// =========================
// CREATE SERVICE API
// =========================

app.post("/api/services", (req, res) => {

    const {
        service_name,
        service_price,
        service_duration,
        service_image
    } = req.body;

    const sql = `
        INSERT INTO services
        (service_name, service_price, service_duration, service_image)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            service_name,
            service_price,
            service_duration,
            service_image
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Service Add Failed"
                });
            }

            res.json({
                success: true,
                message: "Service Added Successfully"
            });

        }
    );

});

// =========================
// DELETE SERVICE API
// =========================

app.delete("/api/services/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM services WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Service Delete Failed"
            });

        }

        res.json({
            success: true,
            message: "Service Deleted Successfully"
        });

    });

});
// =========================
// UPDATE SERVICE API
// =========================

app.put("/api/services/:id", (req, res) => {

    const id = req.params.id;

    const {
        service_name,
        service_price,
        service_duration,
        service_image
    } = req.body;

    const sql = `
        UPDATE services
        SET
        service_name = ?,
        service_price = ?,
        service_duration = ?,
        service_image = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            service_name,
            service_price,
            service_duration,
            service_image,
            id
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Service Update Failed"
                });

            }

            res.json({
                success: true,
                message: "Service Updated Successfully"
            });

        }
    );

});
// =========================
// DASHBOARD STATS API
// =========================

app.get("/api/dashboard", (req, res) => {

   const sql = `
    SELECT
        (SELECT COUNT(*) FROM services) AS totalServices,

        (SELECT COUNT(*) FROM bookings) AS totalBookings,

        (SELECT COUNT(DISTINCT customer_mobile) FROM bookings) AS totalCustomers,

    (SELECT IFNULL(SUM(s.service_price),0)
 FROM bookings b
 JOIN services s
 ON b.service = s.service_name) AS totalRevenue,

 (SELECT COUNT(*)
 FROM bookings
 WHERE booking_date = CURDATE()) AS todayBookings

`;

    db.query(sql, (err, result) => {

        if (err) {

           console.log("Dashboard SQL Error:", err);

            return res.status(500).json({
                success: false,
                message: "Dashboard Error"
            });

        }

        res.json(result[0]);

    });

});

// =========================
// RECENT BOOKINGS
// =========================

app.get("/api/recent-bookings", (req, res) => {

    const sql = `
        SELECT
            customer_name,
            service,
            booking_date,
            booking_time,
            status
        FROM bookings
        ORDER BY id DESC
        LIMIT 5
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to load recent bookings"
            });

        }

        res.json(result);

    });

});

// =========================
// GET ALL CUSTOMERS
// =========================

app.get("/api/customers", (req, res) => {

    const sql = `
        SELECT
            id,
            customer_name,
            customer_mobile,
            service,
            booking_date,
            booking_time
        FROM bookings
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch customers"
            });

        }

        res.json(results);

    });

});
// =========================
// DELETE CUSTOMER
// =========================

app.delete("/api/customers/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM bookings WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Customer Delete Failed"
            });

        }

        res.json({
            success: true,
            message: "Customer Deleted Successfully"
        });

    });

});
// =========================
// GET GALLERY IMAGES
// =========================

app.get("/api/gallery", (req, res) => {

    const sql = "SELECT * FROM gallery ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch gallery"
            });

        }

        res.json(results);

    });

});

// =========================
// ADD GALLERY IMAGE
// =========================

app.post("/api/gallery", (req, res) => {

    const { image } = req.body;

    const sql = "INSERT INTO gallery (image) VALUES (?)";

    db.query(sql, [image], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Image Upload Failed"
            });

        }

        res.json({
            success: true,
            message: "Image Added Successfully"
        });

    });

});

// =========================
// ADMIN LOGIN API
// =========================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT * FROM admins
        WHERE username = ? AND password = ?
    `;

    db.query(sql, [username, password], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Server Error"
            });

        }

        if (result.length > 0) {

            return res.json({
                success: true,
                message: "Login Successful"
            });

        }

        res.status(401).json({
            success: false,
            message: "Invalid Username or Password"
        });

    });

});
// =========================
// GET SETTINGS
// =========================

app.get("/api/settings", (req, res) => {

    const sql = "SELECT * FROM settings LIMIT 1";

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch settings"
            });

        }

        res.json(result[0]);

    });

});

// =========================
// UPDATE SETTINGS
// =========================

app.put("/api/settings", (req, res) => {

    const {
        salon_name,
        salon_phone,
        salon_email,
        salon_address
    } = req.body;

    const sql = `
        UPDATE settings
        SET
            salon_name = ?,
            salon_phone = ?,
            salon_email = ?,
            salon_address = ?
        WHERE id = 1
    `;

    db.query(
        sql,
        [
            salon_name,
            salon_phone,
            salon_email,
            salon_address
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Settings Update Failed"
                });

            }

            res.json({
                success: true,
                message: "Settings Updated Successfully"
            });

        }
    );

});
// =========================
// GET AVAILABLE TIME SLOTS
// =========================

app.get("/api/time-slots", (req, res) => {

    const { date } = req.query;

    const slotSql = `
        SELECT slot_time
        FROM time_slots
        ORDER BY slot_time ASC
    `;

    db.query(slotSql, (err, allSlots) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Failed to load slots"
            });
        }

        
        if (!date) {
            return res.json(allSlots);
        }

        const bookingSql = `
            SELECT booking_time
            FROM bookings
            WHERE booking_date = ?
        `;

        db.query(bookingSql, [date], (err, bookedSlots) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to load booked slots"
                });
            }

            const booked = bookedSlots.map(slot => slot.booking_time);

            const available = allSlots.filter(slot =>
                !booked.includes(slot.slot_time)
            );

            res.json(available);

        });

    });

});

// =========================
// GET BOOKING PAYMENT DETAILS
// =========================

app.get("/api/payment/:bookingId", (req, res) => {

    const { bookingId } = req.params;

    const sql = `
        SELECT
            id,
            customer_name,
            customer_email,
            service,
            payment_amount,
            payment_status
        FROM bookings
        WHERE id = ?
    `;

    db.query(sql, [bookingId], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        if (result.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Booking Not Found"
            });

        }

        res.json(result[0]);

    });

});

// =========================
// CREATE RAZORPAY ORDER
// =========================

app.post("/api/create-order", async (req, res) => {

    try {

        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Razorpay accepts amount in paise
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Order Creation Failed"
        });

    }

});

// =========================
// UPDATE PAYMENT STATUS
// =========================

app.put("/api/payment/:bookingId", (req, res) => {

    const { bookingId } = req.params;
    const { payment_id } = req.body;

    const sql = `
        UPDATE bookings
        SET
            payment_status = 'Paid',
            payment_id = ?
        WHERE id = ?
    `;

    db.query(sql, [payment_id, bookingId], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Payment Update Failed"
            });

        }

        // =========================
        // SEND PAYMENT SUCCESS EMAIL
        // =========================

        const getBookingSql = `
            SELECT *
            FROM bookings
            WHERE id = ?
        `;

        db.query(getBookingSql, [bookingId], async (err, result) => {

            if (err) {

                console.log(err);

            } else if (result.length > 0) {

                const booking = result[0];

                console.log("===== PAYMENT EMAIL DEBUG =====");
                console.log(booking);
                console.log("Customer Email:", booking.customer_email);
                console.log("Payment ID:", payment_id);

                try {

                    await sendPaymentSuccessEmail(
                        booking.customer_email,
                        booking
                    );

                } catch (emailError) {

                    console.log("Payment Email Error:", emailError);

                }

            }

        });

        res.json({
            success: true,
            message: "Payment Updated Successfully"
        });

    });

});

// =========================
// DOWNLOAD PDF INVOICE
// =========================

app.get("/api/invoice/:bookingId", (req, res) => {

    const { bookingId } = req.params;

    const sql = `
        SELECT *
        FROM bookings
        WHERE id = ?
    `;

    db.query(sql, [bookingId], (err, result) => {

        if (err || result.length === 0) {

            return res.status(404).send("Booking Not Found");

        }

        const booking = result[0];

       const doc = new PDFDocument({

    size: "A4",

    margin: 50

});

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Invoice_${booking.id}.pdf`
        );

        const invoicePath = `./invoices/Invoice_${booking.id}.pdf`;

if (!fs.existsSync("./invoices")) {

    fs.mkdirSync("./invoices");

}

const stream = fs.createWriteStream(invoicePath);

doc.pipe(stream);
doc.pipe(res);

        // =========================
// HEADER
// =========================

doc
    .rect(0, 0, 595, 110)
    .fill("#D4AF37");

doc
    .fillColor("white")
    .fontSize(30)
    .text("SalonHub", 50, 35);

doc
    .fontSize(16)
    .text("PAYMENT INVOICE", 50, 72);

doc
    .fillColor("black");

doc.moveDown(4);

        doc.moveDown();

        // =========================
// INVOICE DETAILS
// =========================

doc
    .fontSize(18)
    .fillColor("#D4AF37")
    .text("Invoice Details", 50, 140);

doc
    .moveTo(50, 165)
    .lineTo(545, 165)
    .strokeColor("#D4AF37")
    .stroke();

doc
    .fillColor("black")
    .fontSize(13);

doc.text(`Invoice No`, 50, 185);
doc.text(`: INV-${String(booking.id).padStart(5, "0")}`, 180, 185);

doc.text(`Customer Name`, 50, 210);
doc.text(`: ${booking.customer_name}`, 180, 210);

doc.text(`Mobile Number`, 50, 235);
doc.text(`: ${booking.customer_mobile}`, 180, 235);

doc.text(`Email Address`, 50, 260);
doc.text(`: ${booking.customer_email}`, 180, 260);

doc.text(`Service`, 50, 285);
doc.text(`: ${booking.service}`, 180, 285);

doc.text(`Booking Date`, 50, 310);
doc.text(`: ${new Date(booking.booking_date).toLocaleDateString("en-GB")}`, 180, 310);

doc.text(`Booking Time`, 50, 335);
doc.text(`: ${booking.booking_time}`, 180, 335);

doc.text(`Payment Status`, 50, 360);
doc.text(`: ${booking.payment_status}`, 180, 360);

doc.text(`Payment ID`, 50, 385);
doc.text(`: ${booking.payment_id || "-"}`, 180, 385);

doc
    .fontSize(16)
    .fillColor("green");

doc.text(`Total Amount : ₹${booking.payment_amount}`, 50, 430);

       // =========================
// FOOTER
// =========================

doc.moveDown(3);

doc
    .moveTo(50, 500)
    .lineTo(545, 500)
    .strokeColor("#D4AF37")
    .stroke();

doc
    .fillColor("#D4AF37")
    .fontSize(18)
    .text("Thank You For Choosing SalonHub ❤️", {
        align: "center"
    });

doc.moveDown();

doc
    .fillColor("black")
    .fontSize(12)
    .text(
        "We appreciate your trust in SalonHub. We look forward to serving you again.",
        {
            align: "center"
        }
    );

doc.moveDown(2);

doc
    .fontSize(12)
    .text("Authorized Signature", 400);

doc
    .moveTo(390, 620)
    .lineTo(540, 620)
    .stroke();

doc
    .fontSize(10)
    .fillColor("gray")
    .text(
        "This is a computer-generated invoice and does not require a physical signature.",
        50,
        700,
        {
            align: "center"
        }
    );

doc.end();

    });

});

// =========================
// DASHBOARD STATS API
// =========================

app.get("/api/dashboard", (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS totalBookings,
            SUM(payment_amount) AS totalRevenue,
            SUM(CASE WHEN DATE(booking_date) = CURDATE() THEN 1 ELSE 0 END) AS todayBookings,
            SUM(CASE WHEN DATE(booking_date) = CURDATE() THEN payment_amount ELSE 0 END) AS todayRevenue
        FROM bookings
        WHERE payment_status = 'Paid'
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false
            });

        }

        res.json(result[0]);

    });

});
app.get("/", (req, res) => {
  res.send("SalonHub Backend is Running 🚀");
});
// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
