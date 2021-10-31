import express = require('express')

const accountRouter = express.Router()

accountRouter.post('', async(req, res) => {
    console.log(req.body.email)
    res.send('Account Created')
})

export = accountRouter
