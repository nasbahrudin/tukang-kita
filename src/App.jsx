import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, getCurrentUser } from './lib/supabase'
import { initMidtrans } from './lib/midtrans'
import './App.css'

import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import PostJob from './pages/PostJob'
import JobBoard from './pages/JobBoard'
import JobDetail from './pages/JobDetail'
import MyJobs from './pages/MyJobs'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initMidtrans()

    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await getCurrentUser()
          setUser(profile)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/post-job" element={user?.role === 'customer' ? <PostJob user={user} /> : <Navigate to="/dashboard" />} />
        <Route path="/loker" element={user?.role === 'tukang' ? <JobBoard user={user} /> : <Navigate to="/dashboard" />} />
        <Route path="/job/:id" element={user ? <JobDetail user={user} /> : <Navigate to="/login" />} />
        <Route path="/my-jobs" element={user ? <MyJobs user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App
