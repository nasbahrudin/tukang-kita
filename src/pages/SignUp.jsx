import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../lib/supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { success, error: signUpError } = await signUp(email, password, name, phone, role)

    if (success) {
      alert('Akun telah dibuat! Menunggu verifikasi dari admin (via WhatsApp)')
      navigate('/login')
    } else {
      setError(signUpError || 'Pendaftaran gagal')
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Daftar Tukang Kita</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Nama Lengkap</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Nomor WhatsApp</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="628xxxxxxxxxx" required />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Saya mencari tukang (Pelanggan)</option>
            <option value="tukang">Saya seorang tukang</option>
          </select>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required />
        </div>

        <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>

      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        Verifikasi dilakukan via WhatsApp untuk keamanan.
      </p>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Sudah punya akun? <Link to="/login">Login di sini</Link>
      </p>
    </div>
  )
}
