import React, { useState } from "react"
import * as api from '../lib/api'
import { SessionResponse } from "../types/api-responses"
import { SessionSetters } from "../types/types"
import SuccessfulRegister from "./SuccessfulRegister"
import axios, { AxiosError } from "axios"

export interface Params extends SessionSetters {
    session: SessionResponse | null
}

function Register({ setCookie, session, setSession }: Params) {
    const [formValues, setFormValues] = useState({email: '', password: '', displayName: ''})
    const [error, setError] = useState('')
    const [registered, setRegistered] = useState(false)

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({...formValues, [event.target.name]: event.target.value})
    }

    const register = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // validate form inputs
        if (formValues.email.search('@') === -1) {
            setError('Please input a valid email')
            return
        } else if (formValues.password.trim().length < 9) {
            setError('Please input a password of minimum 9 characters')
            return
        } else if (formValues.password.search(/[$-/:-?{-~!"^_`\[\]]/) === -1) {
            setError('Please include a symbol in your password')
            return
        } else if (formValues.password.search(/[0-9]/) === -1) {
            setError('Please include a number in your password')
            return
        } else if (formValues.displayName.length < 3) {
            setError('Please input a display name of minimum 3 characters')
        }

        let sessionId: string
        try {
            sessionId = await api.createAccount(formValues.email, formValues.password, formValues.displayName)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data['error'])
            } else {
                setError('Unexpected error')
            }
            return
        }
        
        setCookie('session_id', sessionId)
        const session = await api.getSession(sessionId)
        setSession(session)
        setError('')
        setRegistered(true)
    }
    
    return (
        <div>
            <div className="flex flex-col">
                {
                    registered && session && 
                    <SuccessfulRegister email={session.account_email}/>
                }
                { error.length > 0 && 
                    <div>
                        { error }
                    </div>
                }
                {
                    !registered && 
                    <form onSubmit={register}>
                        <label>
                            Email: 
                            <input type="email" name="email" onChange={onChange}/>
                        </label>
                        <label>
                            Password: 
                            <input minLength={9} type="password" name="password" onChange={onChange}/>
                        </label>
                        <label>
                            Display Name: 
                            <input minLength={3} type="text" name="displayName" onChange={onChange}/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                }
            </div>
        </div>
    )
}

export default Register
