import { SessionResponse } from "./api-responses";

export interface SessionSetters {
    setCookie: Function,
    setSession: React.Dispatch<React.SetStateAction<SessionResponse | null>>
}