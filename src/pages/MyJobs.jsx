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

  const isCustomer = user?.role === 'customer'

  useEffect(() => {
    loadMyJobs()
  }, [])

  const loadMyJobs = async () => {
    setLoading(true)
    let data = []

    if (user?.role === 'customer') {
      // Pull each job WITH its acceptance(s) so we can show who took it.
      const result = await supabase
        .from('bookings')
        .select(`
          *,
          assignments:job_assignments(
            sequence,
            accepted_at,
            tukang:tukang_id(name)
          )
        `)
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

  // --- helpers ------------------------------------------------------------
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  // A job is expired if its needed-date is before TODAY (end-of-day logic:
  // a job needed "30 Jun" stays valid for all of 30 Jun), and it has not
  // been accepted or completed.
  const isExpired = (job) => {
    if (!job.date_needed) return false
    if (job.status === 'accepted' || job.status === 'completed') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const needed = new Date(job.date_needed)
    needed.setHours(0, 0, 0, 0)
    return needed < today
  }

  // Name of the first tukang who accepted (lowest sequence)
  const firstTukangName = (job) => {
    const a = (job.assignments || []).slice().sort(
      (x, y) => (x.sequence || 0) - (y.sequence || 0)
    )[0]
    return a?.tukang?.name
  }

  return (
    <div>
      <Header user={user} onLogout={() => navigate('/login')} />
      <div className="container" style={{ marginTop: '40px' }}>
        <h2>{isCustomer ? 'Bantuan Saya' : 'Pekerjaan Saya'}</h2>

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
              {isCustomer ? '📋' : '🔧'}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>
              {isCustomer ? 'Belum ada bantuan' : 'Belum ada pekerjaan'}
            </h3>
            <p style={{ color: '#777', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              {isCustomer
                ? 'Kamu belum membuat permintaan bantuan. Yuk, buat yang pertama!'
                : 'Kamu belum menerima pekerjaan. Cek Loker untuk cari pekerjaan!'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(isCustomer ? '/post-job' : '/loker')}
            >
              {isCustomer ? 'Minta Bantuan Baru' : 'Cari Pekerjaan (Loker)'}
            </button>
          </div>
        ) : (
          <div>
            {jobs.map(job => {
              const expired = isCustomer && isExpired(job)
              const tukangName = firstTukangName(job)
              const accepted = job.status === 'accepted'
              const completed = job.status === 'completed'

              // Decide the status pill (label, bg, text color)
              let pill = { label: 'Menunggu tukang', bg: '#f1efe8', color: '#5f5e5a', icon: '🕓' }
              if (completed) pill = { label: 'Selesai', bg: '#f4c0d1', color: '#72243e', icon: '✓' }
              else if (accepted) pill = { label: 'Diterima', bg: '#e1f5ee', color: '#0f6e56', icon: '👷' }
              else if (expired) pill = { label: 'Kadaluarsa', bg: '#fceaea', color: '#a32d2d', icon: '⚠️' }

              return (
                <div key={job.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3>{job.job_type}</h3>
                      <p style={{ color: '#666', marginTop: '4px' }}>{job.address}</p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', backgroundColor: pill.bg, color: pill.color,
                        borderRadius: '20px', fontSize: '12px', fontWeight: '500'
                      }}>
                        <span>{pill.icon}</span> {pill.label}
                      </span>
                    </div>
                  </div>

                  {/* Two dates: posted + needed */}
                  <div style={{
                    display: 'flex', gap: '20px', marginTop: '12px', paddingTop: '12px',
                    borderTop: '1px solid #eee', fontSize: '13px'
                  }}>
                    <div>
                      <div style={{ color: '#999', fontSize: '11px' }}>Diposting</div>
                      <div style={{ color: '#666' }}>{formatDate(job.created_at)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#999', fontSize: '11px' }}>Dibutuhkan</div>
                      <div style={{ color: expired ? '#a32d2d' : '#666' }}>{formatDate(job.date_needed)}</div>
                    </div>
                  </div>

                  {/* Who accepted it */}
                  {tukangName && !completed && (
                    <div style={{
                      marginTop: '12px', padding: '8px 12px', background: '#faf9f6',
                      borderRadius: '8px', fontSize: '13px', color: '#666'
                    }}>
                      🔧 Dikerjakan oleh <strong style={{ color: '#333' }}>{tukangName}</strong>
                    </div>
                  )}

                  {/* Expired nudge */}
                  {expired && (
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      Tanggal sudah lewat. Posting ulang jika masih perlu.
                    </p>
                  )}

                  <div style={{ marginTop: '16px' }}>
                    {accepted && (
                      <button className="btn btn-primary" onClick={() => setShowDeliveryOrder(job.id)}>
                        Tandai Selesai
                      </button>
                    )}
                    {completed && (
                      <button className="btn btn-secondary" onClick={() => setShowRatingForm(job.id)}>
                        Beri Rating
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
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
