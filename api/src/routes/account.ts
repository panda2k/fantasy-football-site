import express = require('express')
import * as accountServices from '../services/account'
import { CreateAccountRequest, LoginRequest, CreateVerifyEmailRequest, CreateVerifyIpRequest, VerifyRequest } from '../types/request-types'

const accountRouter = express.Router()

accountRouter.post('', async(req: express.Request<{}, {}, CreateAccountRequest>, res) => {
    // light verification of email
    try {
        if (!req.body.email.includes('@')) {
            return res.status(400).json({'error': 'Invalid email'})
        }
    } catch (error) {
        if (error instanceof TypeError) {
            return res.status(400).json({'error': 'Must provide email'})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }

    // password verification
    try {
        if (req.body.password.length < 9) {
            return res.status(400).json({'error': 'Password must be at least 9 characters'})
        }
    } catch (error) {
        if (error instanceof TypeError) {
            return res.status(400).json({'error': 'Must provide password'})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }


    if (req.body.password.search(/[$-/:-?{-~!"^_`\[\]]/) == -1) { // check for symbols
        return res.status(400).json({'error': 'Password must contain a symbol'})
    }

    if (req.body.password.search(/[0-9]/) == -1) { // check for a number
        return res.status(400).json({'error': 'Password must contain a number'})
    }

    // display name verification
    if (!req.body.display_name) {
        return res.status(400).json({'error': 'Must provide display_name'})
    }

    const displayName = req.body.display_name.trim()

    if (displayName.length < 3) {
        return res.status(400).json({'error': 'Display name must be at least 3 characters'})
    }

    try {
        await accountServices.createNewUser(req.body.email, req.body.password, displayName, req.ip)  
    } catch (error: any) {
        if (error.code == 23505) { // unique constraint violation
            if (error.detail.includes('email')) {
                return res.status(400).json({'error': `There already exists an account with email ${req.body.email}`})
            } else {
                return res.status(400).json({'error': error.detail})
            }
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }   

    const sessionId = await accountServices.createSession(req.body.email)
    res.status(202).json({'session_id': sessionId, 'message': `Created account. Check ${req.body.email} for a verification email`})

    await accountServices.createEmailVerificationRequest(req.body.email).catch(error => console.log(error))
    return 
})

accountRouter.post('/login', async(req: express.Request<{}, {}, LoginRequest>, res) => {
    let loginResult = false
    if (!req.body.password) {
        return res.status(400).json({'session_id': '', 'message': 'Must provide password'})
    }

    try {
        loginResult = await accountServices.validateLogin(req.body.email, req.body.password, req.ip)
    } catch (error: any) {
        if (error.message == 'Untrusted IP address') {
            res.status(202).json({'session_id': '', 'message': 'Untrusted IP address. IP verification request sending'})

            await accountServices.createIpVerificationRequest(req.body.email, req.ip).catch(error => console.log(error))
            return
        } else if (error.message == 'Invalid email') {
            return res.status(400).json({'session_id': '', 'message': 'Invalid email'})
        } else if (error.message == 'Max login attempts reached') {
            return res.status(400).json({'session_id': '', 'message': 'Max login attempts reached. Retry in 24 hours'})
        } else {
            console.log(error)
            return res.status(500).json({'message': 'Uncaught error'})
        }
    }

    if (loginResult) {
        const sessionId = await accountServices.createSession(req.body.email)
        return res.status(200).json({'session_id': sessionId, 'message': 'Logged in successfully'})
    } else {
        return res.status(200).json({'session_id': '', 'message': 'Invalid login'})
    }
})

accountRouter.get('/sessions/:sessionId', async(req, res) => {
    const session = await accountServices.getSession(req.params.sessionId)

    if (!session) {
        return res.status(404).json({'error': 'Session not found'})
    }

    return res.status(200).json(session)
})

accountRouter.get('/verifyemail', async(req: express.Request<{}, {}, {}, VerifyRequest>, res) => {
    try {
        await accountServices.verifyEmail(req.query.verificationId)
    } catch (error: any) {
        if (error.message == 'Invalid verification request') {
            return res.status(400).json({'message': 'Invalid verification request'})
        } else if (error.message == 'Expired verification request') {
            return res.status(400).json({'message': 'Expired verification request'})
        } else {
            return res.status(500).json({'message': 'Uncaught error'})
        }
    }

    return res.status(200).json({'message': 'Verified email'})
})

accountRouter.get('/verifyip', async(req: express.Request<{}, {}, {}, VerifyRequest>, res) => {
    try {
        await accountServices.verifyIp(req.query.verificationId)
    } catch (error: any) {
        if (error.message == 'Invalid verification request') {
            return res.status(400).json({'message': 'Invalid verification request'})
        } else if (error.message == 'Expired verification request') {
            return res.status(400).json({'message': 'Expired verification request'})
        } else {
            return res.status(500).json({'message': 'Uncaught error'})
        }
    }

    return res.status(200).json({'message': 'Verified IP'})
})

accountRouter.post('/verifyemail', async(req: express.Request<{}, {}, CreateVerifyEmailRequest>, res) => {
    res.status(202).json({'message': 'Sending email verification request'})

    await accountServices.createEmailVerificationRequest(req.body.email).catch(error => console.log(error))
    return
})

accountRouter.post('/verifyip', async(req: express.Request<{}, {}, CreateVerifyIpRequest>, res) => {
    res.status(202).json({'message': 'Sending IP verification request'})

    await accountServices.createIpVerificationRequest(req.body.email, req.body.ip_address).catch(error => console.log(error))
    return
})

export = accountRouter
