import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailableJobs } from '../lib/supabase'
import Header from '../components/Header'
import JobCard from '../components/JobCard'

export default function JobBoard({ user }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    const { success, jobs: jobsData } = await getAvailableJobs()
    if (success) {
      setJobs(jobsData)
    }
    setLoading(false)
  }

  return (
    <div>
      <Header user={user} onLogout={() => navigate('/login')} />
      <div className="container" style={{ marginTop: '40px' }}>
        <h2>Loker - Pekerjaan Tersedia</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Pilih pekerjaan yang sesuai dengan keahlian Anda
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px', marginTop: '16px',
            background: 'white', border: '1px solid #eee', borderRadius: '10px'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--brand-tint)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              fontSize: '28px'
            }}>
              📭
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>Belum ada pekerjaan tersedia</h3>
            <p style={{ color: '#777', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              Saat ini belum ada pekerjaan di Loker. Cek lagi nanti ya — pekerjaan baru akan muncul di sini.
            </p>
            <button className="btn btn-gray" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <div>
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <button className="btn btn-gray" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
            Kembali ke Dashboard
          </button>
        )}
      </div>
    </div>
  )
}