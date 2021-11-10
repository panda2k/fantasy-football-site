import express from 'express'
import * as WebSocket from 'ws'
import http from 'http'
import bodyParser = require('body-parser')
import cors from 'cors'

// routers
import accountRouter = require('./routes/account')

const port = 8080 || process.env.PORT

// configure and create express server
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use('/accounts', accountRouter)

// create simple http server
const server = http.createServer(app)

// create websocket server instance
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        console.log(`Message received: ${message}`)
        ws.send(`You sent: ${message}`)
    })

    ws.send('Hi there, I am a WebSocket server')
}) 

server.listen(port, () => {
    console.log(`Server started on ${port}`)
})
