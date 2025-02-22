const nodemailer = require('nodemailer')

const sendActivationEmail = async (email, activationLink) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'fhsudoku@gmail.com',
      pass: 'abcd efgh ijkl mnop' // Real Password: SOMESECRET, needs to be adjusted to pass
    },
    family: 4 // ipv4 only
  })

  await transporter.sendMail({
    from: 'fhsudoku',
    to: email,
    subject: 'Activate your account',
    text: `Please activate your account by clicking on the following link: ${activationLink}`,
    html: `<p>Please activate your account by clicking on the following link:</p><a href="${activationLink}">Activate your account</a>`
  })
}

module.exports = {
  sendActivationEmail
}
