export interface CreateAccountRequest {
    email: string,
    password: string,
    display_name: string
}

export interface LoginRequest {
    email: string,
    password: string
}

export interface CreateVerifyEmailRequest {
    email: string
}

export interface CreateVerifyIpRequest {
    email: string,
    ip_address: string
}

export interface VerifyRequest {
    verificationId: string
}
