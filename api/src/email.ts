import nodemailer = require("nodemailer")
import config from '../config.json'

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: true,
    auth: {
        user: config.email.username,
        pass: config.email.password
    }
})

export = {
    send: (from: string, to: string, subject: string, text: string, html: string) => {
        return transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: html
        })
    }
}
