import nodemailer from 'nodemailer';

export async function sendOtpEmail(email: string, otp: number) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Email Verification',
        text: `Your OTP is ${otp}. It will expire in 2 minutes.`,
    };

    await transporter.sendMail(mailOptions);
}
