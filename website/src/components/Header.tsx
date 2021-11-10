import React from 'react'
import { Link } from 'react-router-dom'
import { SessionResponse } from '../types/api-responses'
import { SessionSetters } from '../types/types'

interface Params extends SessionSetters {
    session: SessionResponse | null,
}

function Header({ session, setCookie, setSession }: Params) {
    function logout() {
        setSession(null)
        setCookie('session_id', '')
    }

    return (
        <div className="flex flex-row justify-between px-5 py-3">
            <Link to="/">Home</Link>
                {
                    session ?
                    (<div>
                        Welcome back { session.display_name }
                        <button onClick={logout} className="ml-3">Logout</button>
                    </div>) : (
                        <div>
                            <Link className="mr-3" to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </div>
                    )
                }
        </div>
    )
}

export default Header
