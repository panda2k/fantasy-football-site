import axios from 'axios'
import { MessageOnlyResponse, SessionIdResponse, SessionResponse } from '../types/api-responses'

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8080'
})

export const createAccount = async(email: string, password: string, displayName: string): Promise<string> => {
    return instance.post<SessionIdResponse>('/accounts', {
        email: email,
        password: password,
        display_name: displayName
    }).then(response => response.data.session_id)
}

export const login = async(email: string, password: string): Promise<string> => {
    return instance.post<SessionIdResponse>('/accounts/login', {
        email: email,
        password: password
    }).then(response => response.data.session_id)
}

export const verifyEmail = async(verificationId: string): Promise<string> => {
    return instance.get<MessageOnlyResponse>('/accounts/verifyemail', {
        params: { verificationId: verificationId }
    }).then(response => response.data.message)
}

export const getSession = async(sessionId: string): Promise<SessionResponse> => {
    return instance.get<SessionResponse>(`/accounts/sessions/${sessionId}`).then(response => response.data)
}
