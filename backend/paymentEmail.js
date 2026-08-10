const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

// =========================
// VERIFY SMTP
// =========================

transporter.verify(function (error, success) {

    if (error) {

        console.log("❌ SMTP VERIFY ERROR:");
        console.log(error);

    } else {

        console.log("✅ SMTP Server Ready");

    }

});

// =========================
// PAYMENT SUCCESS EMAIL
// =========================

async function sendPaymentSuccessEmail(to, booking) {

    try {

        await transporter.sendMail({

            from: `"SalonHub" <${process.env.EMAIL_USER}>`,

            to,

            subject: "Payment Successful | SalonHub",

            html: `

            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;border:1px solid #ddd;border-radius:10px;">

                <h2 style="color:green;">
                    ✅ Payment Successful
                </h2>

                <p>Hello <b>${booking.customer_name}</b>,</p>

                <p>
                    Your payment has been received successfully.
                </p>

                <hr>

                <p><b>💇 Service:</b> ${booking.service}</p>

                <p><b>💰 Amount:</b> ₹${booking.payment_amount}</p>

                <p><b>📌 Payment Status:</b> Paid</p>

                <hr>

                <p>
                    Thank you for choosing <b>SalonHub</b>.
                </p>

                <p>
                    Your invoice is attached with this email.
                </p>

                <p>
                    We look forward to serving you again.
                </p>

            </div>

            `,

            attachments: [

                {

                    filename: `Invoice_${booking.id}.pdf`,

                    path: `./invoices/Invoice_${booking.id}.pdf`

                }

            ]

        });

        console.log("✅ Payment Success Email Sent");

    } catch (err) {

        console.log("❌ Payment Email Error:");

        console.log(err);

    }

}

module.exports = sendPaymentSuccessEmail;