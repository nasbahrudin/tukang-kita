import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, confirmJobComplete } from '../lib/supabase'
import Header from '../components/Header'
import DeliveryOrder from '../components/DeliveryOrder'
import RatingForm from '../components/RatingForm'

export default function MyJobs({ user }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeliveryOrder, setShowDeliveryOrder] = useState(null)
  const [showRatingForm, setShowRatingForm] = useState(null)

  useEffect(() => {
    loadMyJobs()
  }, [])

  const loadMyJobs = async () => {
    setLoading(true)
    let data = []

    if (user?.role === 'customer') {
      const result = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      data = result.data || []
    } else {
      const { data: assignments } = await supabase
        .from('job_assignments')
        .select('booking_id')
        .eq('tukang_id', user.id)

      const bookingIds = assignments?.map(a => a.booking_id) || []
      if (bookingIds.length > 0) {
        const result = await supabase
          .from('bookings')
          .select('*')
          .in('id', bookingIds)
          .order('created_at', { ascending: false })
        data = result.data || []
      }
    }

    setJobs(data)
    setLoading(false)
  }

  const handleConfirmComplete = async (jobId) => {
    await confirmJobComplete(jobId, user.id, user.role)
    await loadMyJobs()
    setShowDeliveryOrder(null)
    setShowRatingForm(jobId)
  }

  return (
    <div>
      <Header user={user} onLogout={() => navigate('/login')} />
      <div className="container" style={{ marginTop: '40px' }}>
        <h2>{user?.role === 'customer' ? 'Pekerjaan Saya (Pelanggan)' : 'Pekerjaan Saya (Tukang)'}</h2>

        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <p>Tidak ada pekerjaan</p>
        ) : (
          <div>
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3>{job.job_type}</h3>
                    <p style={{ color: '#666', marginTop: '4px' }}>{job.address}</p>
                    <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                      {new Date(job.date_needed).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', padding: '6px 12px',
                      backgroundColor: job.status === 'completed' ? '#1D9E75' : '#D85A30',
                      color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: '500'
                    }}>
                      {job.status === 'available' ? 'Available' :
                       job.status === 'accepted' ? 'Accepted' :
                       job.status === 'completed' ? 'Completed' : job.status}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {job.status === 'accepted' && (
                    <button className="btn btn-primary" onClick={() => setShowDeliveryOrder(job.id)}>
                      Mark as Complete
                    </button>
                  )}
                  {job.status === 'completed' && (
                    <button className="btn btn-secondary" onClick={() => setShowRatingForm(job.id)}>
                      Add Rating
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDeliveryOrder && (
          <DeliveryOrder jobId={showDeliveryOrder}
            onConfirm={() => handleConfirmComplete(showDeliveryOrder)}
            onClose={() => setShowDeliveryOrder(null)} />
        )}

        {showRatingForm && (
          <RatingForm jobId={showRatingForm} onClose={() => setShowRatingForm(null)} />
        )}
      </div>
    </div>
  )
}
