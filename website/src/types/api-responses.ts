export interface SessionIdResponse {
    session_id: string,
    message: string
}

export interface MessageOnlyResponse {
    message: string
}

export interface SessionResponse {
    session_id: string,
    expiration_time: number, 
    account_email: string,
    verified_email: boolean,
    display_name: string
}
