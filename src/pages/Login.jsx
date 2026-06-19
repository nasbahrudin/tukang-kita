import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { success, error: signInError } = await signIn(email, password)

    if (success) {
      navigate('/dashboard')
    } else {
      setError(signInError || 'Login gagal')
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>Login ke Tukang Kita</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Belum punya akun? <Link to="/signup">Daftar di sini</Link>
      </p>
    </div>
  )
}
