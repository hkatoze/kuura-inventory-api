const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


async function sendOtpEmail(to, code) {

    const msg = {
      to: to, 
      from: process.env.FROM_EMAIL, 
      subject: "Votre code OTP - Vote Campus",
      text: "and easy to do anywhere, even with Node.js",
      html: `
        <p>Bonjour,</p>
        <p>Votre code OTP est : <strong>${code}</strong></p>
        <p>Il expire dans 1H.</p>
      `,
    };
    sgMail
      .send(msg)
      .then(() => {
       console.log("Sengrid email sent:", result);
      })
      .catch((error) => {
 console.error("Sengrid ERROR:", error.response?.body || error);
 throw new Error("Erreur lors de l’envoi du mail OTP");
      });



}

module.exports = { sendOtpEmail };

 