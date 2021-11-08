import db = require('../db')
import bcrypt = require('bcryptjs')
import { EmailVerificationRequest, IpVerificationRequest, TrustedIp, UserAccount } from '../types/types'
import { randomBytes } from 'crypto'
import mail = require('../email')

const MAX_LOGIN_ATTEMPTS = 4

export const createNewUser = async(email: string, password: string, displayName: string, ipAddress: string): Promise<void> => {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)

    await db.query(
        'INSERT INTO users(email, display_name, password, verified_email) VALUES($1, $2, $3, $4)',
        [email, displayName, hash, false]
    )

    await db.query(
        'INSERT INTO trusted_ips(ip_address, account_email, expiration_time) VALUES($1, $2, $3)',
        [ipAddress, email, + new Date() + 1000 * 60 * 60 * 24 * 30]
    )
}

export const validateLogin = async(email: string, password: string, ipAddress: string): Promise<boolean> => {
    const account: UserAccount | null = (await db.query('SELECT * FROM users WHERE email=$1', [email])).rows[0] as unknown as UserAccount | null
    
    if (!account) { 
        throw new Error('Invalid email')
    }

    if (account.account_unlock_time != 0 && account.account_unlock_time < + new Date()) {
        await db.query(
            'UPDATE users SET account_unlock_time=$1 WHERE email=$2',
            [0, email]
        )

        await db.query(
            'UPDATE users SET failed_login_attempts=$1 WHERE email=$2',
            [0, email]
        )
    }

    if (account.failed_login_attempts == MAX_LOGIN_ATTEMPTS) {
        await db.query(
            'UPDATE users SET account_unlock_time=$1 WHERE email=$2',
            [+ new Date() + 1000 * 60 * 60 * 24, email]
        )
    }

    if (account.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
        throw new Error('Max login attempts reached')
    }

    if (bcrypt.compareSync(password, account.password)) {
        const trustedIps = await getAccountTrustedIps(email)

        for (let i = 0; i < trustedIps.length; i++) {
            if (ipAddress == trustedIps[i]['ip_address']) {
                await db.query('UPDATE users SET failed_login_attempts = 0 WHERE email=$1', [email])
                return true
            }
        }

        throw new Error('Untrusted IP address')
    } else {
        await db.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE email=$1', [email])
        return false
    }
}

export const createIpVerificationRequest = async(email: string, ipAddress: string) => {
    const requestExpirationTime = + new Date() + 1000 * 60 * 10
    const verificationKey = randomBytes(16).toString('hex')
    
    await db.query(
        'INSERT INTO ip_address_verification_requests(ip_address, account_email, expiration_time, verification_key) VALUES($1, $2, $3, $4)',
        [ipAddress, email, requestExpirationTime, verificationKey]
    )

    await mail.send('noreply@themichael.wang', email, 'Verify new IP Address', verificationKey, '')
}

export const createEmailVerificationRequest = async(email: string) => {
    const requestExpirationTime = + new Date() + 1000 * 60 * 60 * 24
    const verificationKey = randomBytes(16).toString('hex')

    await db.query(
        'INSERT INTO email_verification_requests(account_email, expiration_time, verification_key) VALUES($1, $2, $3)',
        [email, requestExpirationTime, verificationKey]
    )

    await mail.send('noreply@themichael.wang', email, 'Verify your email', verificationKey, '')
}

export const createSession = async(email: string): Promise<string> => {
    const sessionId = randomBytes(16).toString('hex')
    const expirationTime = + new Date() + 1000 * 60 * 60 * 7

    await db.query(
        'INSERT INTO sessions(session_id, expiration_time, account_email) VALUES($1, $2, $3)',
        [sessionId, expirationTime, email]
    )

    return sessionId
}

export const verifyEmail = async(verificationKey: string): Promise<void> => {
    const verificationRequest = (await db.query(
        'SELECT * FROM email_verification_requests WHERE verification_key=$1',
        [verificationKey]
    )).rows[0] as unknown as EmailVerificationRequest | null

    if (!verificationRequest) {
        throw Error('Invalid verification request')
    }

    if (verificationRequest.expiration_time < + new Date()) {
        throw Error('Expired verification request')
    }

    await db.query(
        'UPDATE users SET verified_email=$1 WHERE email=$2',
        [true, verificationRequest.account_email]
    )

    await db.query(
        'DELETE FROM email_verification_requests WHERE account_email=$1',
        [verificationRequest.account_email]
    )
} 

export const verifyIp = async(verificationKey: string): Promise<void> => {
    const verificationRequest = (await db.query(
        'SELECT * FROM ip_verification_requests WHERE verification_key=$1',
        [verificationKey]
    )).rows[0] as unknown as IpVerificationRequest | null
    
    if (!verificationRequest) {
        throw new Error('Invalid verification request')
    }

    if (verificationRequest.expiration_time < + new Date()) {
        throw new Error('Expired verification request')
    }
    
    const ipExpirationTime = + new Date() + 1000 * 60 * 60 * 24 * 30

    await db.query(
        'INSERT INTO trusted_ips(ip_address, account_email, expiration_time) VALUES($1, $2, $3)',
        [verificationRequest.ip_address, verificationRequest.account_email, ipExpirationTime]
    )

    await db.query(
        'DELETE FROM ip_address_verification_requests WHERE ip_address=$1 AND account_email=$2',
        [verificationRequest.ip_address, verificationRequest.account_email]
    )
}

const getAccountTrustedIps = async(email: string): Promise<Array<TrustedIp>> => {
    return (await db.query('SELECT * FROM trusted_ips WHERE account_email = $1', [email])).rows as unknown as Array<TrustedIp>
}
