export interface UserAccount {
    email: string,
    display_name: string,
    password: string,
    failed_login_attempts: number,
    account_unlock_time: number
}

export interface TrustedIp {
    ip_address: string,
    account_email: string,
    expiration_time: number,
}

export interface EmailVerificationRequest {
    account_email: string,
    expiration_time: number,
    verification_key: string
}

export interface IpVerificationRequest {
    ip_address: string,
    account_email: string,
    expiration_time: number,
    verification_key: string
}
