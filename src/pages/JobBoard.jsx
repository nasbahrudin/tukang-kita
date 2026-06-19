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
          <p>Tidak ada pekerjaan tersedia saat ini</p>
        ) : (
          <div>
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
            ))}
          </div>
        )}

        <button className="btn btn-gray" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
