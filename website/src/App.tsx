import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionResponse } from './types/api-responses';
import { useCookies } from 'react-cookie';
import * as api from './lib/api'
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['session_id'])
  const [session, setSession] = useState<SessionResponse | null>(null)

  useEffect(() => {
    console.log('use effect')

    const fetchSession = async() => {
      const session = await api.getSession(cookies.session_id).catch(error => null)
      setSession(session)
    }

    fetchSession()
  }, [])

  return (
    <div className="App">
      <BrowserRouter>
        <Header session={ session } setCookie={setCookie} setSession={setSession}/>
        <Routes>
          <Route path="/"></Route>
          <Route path="/login" element={<Login setCookie={setCookie} setSession={setSession}/>}></Route>
          <Route path="/register" element={<Register session={session} setCookie={setCookie} setSession={setSession}/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
