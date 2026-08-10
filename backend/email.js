const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",
auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS

}

});

async function sendBookingEmail(to, booking) {

    try {

        await transporter.sendMail({

            from: '"SalonHub" <moreabhishek2275@gmail.com>',

            to,

            subject: "Booking Request Received | SalonHub",

            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">

                    <h2 style="color:#D4AF37;">
                        Booking Request Received 📅
                    </h2>

                    <p>Hello <b>${booking.customer_name}</b>,</p>

                    <p>
                        Thank you for choosing <b>SalonHub</b>.
                        We have received your booking request.
                    </p>

                    <p>
                        Our team will review your request and confirm your appointment shortly.
                    </p>

                    <hr>

                    <h3>Booking Details</h3>

                    <p><b>💇 Service:</b> ${booking.service}</p>

                    <p><b>📅 Date:</b> ${booking.booking_date}</p>

                    <p><b>🕒 Time:</b> ${booking.booking_time}</p>

                    <hr>

                    <p>
                        Thank you for choosing <b>SalonHub</b>.
                    </p>

                    <p>
                        We look forward to serving you.
                    </p>

                </div>
            `

        });

        console.log("✅ Booking Email Sent Successfully");

    } catch (error) {

        console.log("❌ Email Error:", error);

    }

}

async function sendConfirmationEmail(to, booking) {

    try {

        await transporter.sendMail({

            from: '"SalonHub" <moreabhishek2275@gmail.com>',

            to,

            subject: "Appointment Confirmed | SalonHub",

            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">

                    <h2 style="color:green;">
                        ✅ Appointment Confirmed
                    </h2>

                    <p>Hello <b>${booking.customer_name}</b>,</p>

                    <p>Your appointment has been confirmed.</p>

                    <hr>

                    <p><b>💇 Service:</b> ${booking.service}</p>
                    <p><b>📅 Date:</b> ${booking.booking_date}</p>
                    <p><b>🕒 Time:</b> ${booking.booking_time}</p>

                    <hr>
                    <div style="text-align:center; margin:30px 0;">

    <a href="http://localhost:5500/payment.html?bookingId=${booking.id}"
       style="
            background:#D4AF37;
            color:white;
            padding:15px 30px;
            text-decoration:none;
            border-radius:8px;
            font-size:18px;
            display:inline-block;
       ">

        💳 Pay Now

    </a>

</div>

                    <p>Thank you for choosing <b>SalonHub</b>.</p>

                </div>
            `

        });

        console.log("✅ Confirmation Email Sent");

    } catch (error) {

        console.log("❌ Confirmation Email Error:", error);

    }

}
async function sendCompletedEmail(to, booking) {

    try {

        await transporter.sendMail({

            from: '"SalonHub" <moreabhishek2275@gmail.com>',

            to,

            subject: "Thank You for Visiting SalonHub ❤️",

            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">

                    <h2 style="color:#D4AF37;">
                        Thank You ❤️
                    </h2>

                    <p>Hello <b>${booking.customer_name}</b>,</p>

                    <p>
                        Your appointment has been completed successfully.
                    </p>

                    <p>
                        Thank you for choosing <b>SalonHub</b>.
                    </p>

                    <p>
                        We hope you enjoyed our service and look forward to serving you again.
                    </p>

                </div>
            `

        });

        console.log("✅ Completed Email Sent");

    } catch (error) {

        console.log("❌ Completed Email Error:", error);

    }

}

module.exports = {
    sendBookingEmail,
    sendConfirmationEmail,
    sendCompletedEmail
};