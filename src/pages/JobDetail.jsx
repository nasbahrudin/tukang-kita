import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, acceptJob } from '../lib/supabase'
import Header from '../components/Header'

export default function JobDetail({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:customer_id(*)')
      .eq('id', id)
      .single()

    if (!error) {
      setJob(data)
    }
    setLoading(false)
  }

  const handleAccept = async () => {
    setAccepting(true)
    const { success } = await acceptJob(job.id, user.id)

    if (success) {
      alert('Pekerjaan berhasil diterima!')
      navigate('/my-jobs')
    } else {
      alert('Gagal menerima pekerjaan')
    }
    setAccepting(false)
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!job) return <div className="container"><p>Pekerjaan tidak ditemukan</p></div>

  const cleanPhone = job.customer?.phone?.replace(/\D/g, '') || ''
  const whatsappLink = `https://wa.me/${cleanPhone}?text=Halo, saya tertarik dengan pekerjaan Anda (ID: ${job.id})`

  return (
    <div>
      <Header user={user} onLogout={() => navigate('/login')} />
      <div className="container" style={{ marginTop: '40px', maxWidth: '600px' }}>
        <button className="btn btn-gray" onClick={() => navigate('/loker')} style={{ marginBottom: '20px' }}>
          &larr; Kembali ke Loker
        </button>

        <div className="card">
          <h2>{job.job_type}</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>{job.address}</p>

          <p style={{ marginTop: '16px' }}>
            <strong>Tanggal Dibutuhkan:</strong> {new Date(job.date_needed).toLocaleDateString('id-ID')}
          </p>

          <p style={{ marginTop: '12px' }}><strong>Deskripsi:</strong></p>
          <p style={{ whiteSpace: 'pre-wrap', color: '#666' }}>{job.description}</p>

          <hr style={{ margin: '20px 0' }} />

          <p><strong>Pelanggan:</strong> {job.customer?.name}</p>
          <p style={{ marginTop: '8px' }}>
            <strong>Nomor:</strong> {job.customer?.phone}
            {job.customer?.verified && <span className="verified-badge">Verified</span>}
          </p>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            {user?.role === 'tukang' && job.status === 'available' && (
              <>
                <button className="btn btn-primary" onClick={handleAccept} disabled={accepting} style={{ flex: 1 }}>
                  {accepting ? 'Accepting...' : 'Terima Pekerjaan'}
                </button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary"
                   style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                  Chat WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
