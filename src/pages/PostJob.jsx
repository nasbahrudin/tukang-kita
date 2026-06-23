import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJob } from '../lib/supabase'
import Header from '../components/Header'

const JOB_TYPES = ['Listrik', 'Pipa / Ledeng', 'Renovasi', 'Tukang Kayu', 'Pengecatan', 'Servis AC', 'Las', 'Lainnya']

export default function PostJob({ user }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ jobType: '', address: '', dateNeeded: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { success, error: postError } = await postJob(
      user.id, formData.jobType, formData.address, formData.dateNeeded, formData.description
    )

    if (success) {
      alert('Permintaan bantuan berhasil diposting!')
      navigate('/my-jobs')
    } else {
      setError(postError || 'Posting gagal')
    }

    setLoading(false)
  }

  return (
    <div>
      <Header user={user} onLogout={() => navigate('/login')} />
      <div className="container" style={{ marginTop: '40px', maxWidth: '600px' }}>
        <h2>Minta Bantuan Baru</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jenis Bantuan</label>
            <select name="jobType" value={formData.jobType} onChange={handleChange} required>
              <option value="">Pilih jenis bantuan</option>
              {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Alamat Lengkap</label>
            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Jl. Example No. 123, Batam" rows="3" required />
          </div>

          <div className="form-group">
            <label>Tanggal Dibutuhkan</label>
            <input type="date" name="dateNeeded" value={formData.dateNeeded} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Deskripsi Bantuan</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Jelaskan bantuan yang kamu butuhkan..." rows="5" required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
        </form>
      </div>
    </div>
  )
}