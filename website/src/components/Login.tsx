import React, { useState } from "react"
import { SessionResponse } from "../types/api-responses"
import * as api from '../lib/api'
import { SessionSetters } from "../types/types"

function Login({ setCookie, setSession }: SessionSetters) {
    const [formValues, setFormValues] = useState({email: '', password: ''})
    const [error, setError] = useState('')

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({...formValues, [event.target.name]: event.target.value})
    }
    
    const login = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(formValues)

        const sessionId = await api.login(formValues.email, formValues.password)
        if (sessionId) {
            setCookie('session_id', sessionId)
            const session = await api.getSession(sessionId)
            setSession(session)
            setError('')
        } else {
            setError('Failed login')
        }
    }

    return (
        <div className="flex flex-col">
            { error.length > 0 && 
                <div>
                    { error }
                </div>
            }
            <form onSubmit={login}>
                <label>
                    Email: 
                    <input type="email" name="email" onChange={onChange}/>
                </label>
                <label>
                    Password: 
                    <input type="password" name="password" onChange={onChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
        </div>
    )
}

export default Login
