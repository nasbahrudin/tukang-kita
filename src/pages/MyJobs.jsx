import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, confirmJobComplete, cancelJob } from '../lib/supabase'
import Header from '../components/Header'
import DeliveryOrder from '../components/DeliveryOrder'
import RatingForm from '../components/RatingForm'

export default function MyJobs({ user }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeliveryOrder, setShowDeliveryOrder] = useState(null)
  const [showRatingForm, setShowRatingForm] = useState(null)
  const [confirmingCancel, setConfirmingCancel] = useState(null)

  const ADMIN_WA = '6281222145633'

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
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
      data = result.data || []
    } else {
      const { data: assignments } = await supabase
        .from('job_assignments')
        .select('booking_id')
        .eq('tukang_id', user.id)

      const bookingIds = assignments?.map(a => a.booking_id) || []
      if (bookingIds.length > 0) {
        // Tukang needs to CONTACT and DO the job, so pull the customer's
        // name + phone (from the users table via the customer_id join).
        const result = await supabase
          .from('bookings')
          .select(`
            *,
            customer:customer_id(name, phone)
          `)
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

  const handleCancel = async (jobId) => {
    const result = await cancelJob(jobId)
    setConfirmingCancel(null)
    if (result.success) {
      await loadMyJobs()
    } else {
      alert('Gagal membatalkan: ' + result.error)
    }
  }

  const contactAdminToCancel = (job) => {
    const msg = encodeURIComponent(
      `Halo Admin Tukang Kita. Saya ${user?.name || 'pelanggan'} ingin membatalkan ` +
      `bantuan "${job.job_type}" yang sudah diterima tukang. Mohon bantuannya.`
    )
    window.open(`https://wa.me/${ADMIN_WA}?text=${msg}`, '_blank')
  }

  // --- helpers ------------------------------------------------------------
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  // A job is expired if its needed-date is before TODAY (end-of-day logic:
  // a job needed "30 Jun" stays valid all of 30 Jun), and nobody has taken it.
  const isExpired = (job) => {
    if (!job.date_needed) return false
    if (job.status === 'accepted' || job.status === 'completed') return false
    if ((job.assignments || []).length > 0) return false
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

  const openMaps = (address) => {
    const q = encodeURIComponent(address || '')
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
  }

  const openWhatsApp = (job) => {
    const phone = job.customer?.phone
    if (!phone) return
    const msg = encodeURIComponent(
      `Halo, saya ${user?.name || 'tukang'} dari Tukang Kita. ` +
      `Saya menerima pekerjaan "${job.job_type}" Anda. Boleh kita atur waktunya?`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  // ========================================================================
  // CUSTOMER CARD
  // ========================================================================
  const renderCustomerCard = (job) => {
    const expired = isExpired(job)
    const tukangName = firstTukangName(job)
    const completed = job.status === 'completed'
    const accepted = !completed && (job.status === 'accepted' || !!tukangName)

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

        {tukangName && !completed && (
          <div style={{
            marginTop: '12px', padding: '8px 12px', background: '#faf9f6',
            borderRadius: '8px', fontSize: '13px', color: '#666'
          }}>
            🔧 Dikerjakan oleh <strong style={{ color: '#333' }}>{tukangName}</strong>
          </div>
        )}

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

          {/* Cancel flow — only for jobs not completed */}
          {!completed && (
            <>
              {/* Not taken yet → customer can cancel freely */}
              {!tukangName && job.status !== 'accepted' && (
                confirmingCancel === job.id ? (
                  <div style={{
                    marginTop: '10px', padding: '12px',
                    background: '#fceaea', borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '13px', color: '#a32d2d', marginBottom: '10px' }}>
                      Yakin mau batalkan bantuan ini? Bantuan akan hilang dari daftar dan Loker.
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn"
                        style={{ flex: 1, background: '#a32d2d', color: 'white', border: 'none' }}
                        onClick={() => handleCancel(job.id)}
                      >
                        Ya, batalkan
                      </button>
                      <button
                        className="btn btn-gray"
                        style={{ flex: 1 }}
                        onClick={() => setConfirmingCancel(null)}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn"
                    style={{
                      width: '100%', marginTop: '8px',
                      color: '#a32d2d', borderColor: '#f09595', background: 'white'
                    }}
                    onClick={() => setConfirmingCancel(job.id)}
                  >
                    🗑️ Batalkan
                  </button>
                )
              )}

              {/* Already taken → must go through admin (fairness to tukang) */}
              {(tukangName || job.status === 'accepted') && (
                <>
                  <button
                    className="btn btn-gray"
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => contactAdminToCancel(job)}
                  >
                    💬 Hubungi admin untuk batalkan
                  </button>
                  <p style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                    Tukang sudah menerima, jadi pembatalan lewat admin agar adil untuk tukang.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // ========================================================================
  // TUKANG CARD
  // ========================================================================
  const renderTukangCard = (job) => {
    const completed = job.status === 'completed'
    const customerName = job.customer?.name || 'Pelanggan'
    const customerPhone = job.customer?.phone
    const initial = customerName.charAt(0).toUpperCase()

    let pill = { label: 'Sedang dikerjakan', bg: '#e1f5ee', color: '#0f6e56', icon: '🔧' }
    if (completed) pill = { label: 'Selesai', bg: '#f4c0d1', color: '#72243e', icon: '✓' }

    return (
      <div key={job.id} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0 }}>{job.job_type}</h3>
          <span style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', backgroundColor: pill.bg, color: pill.color,
            borderRadius: '20px', fontSize: '12px', fontWeight: '500'
          }}>
            <span>{pill.icon}</span> {pill.label}
          </span>
        </div>

        {/* Customer block */}
        <div style={{
          marginTop: '12px', padding: '10px 12px', background: '#faf9f6',
          borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--brand-tint, #f4e6eb)', color: 'var(--brand, #72243E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '600', fontSize: '14px', flexShrink: 0
          }}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: '#999' }}>Pelanggan</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{customerName}</div>
          </div>
        </div>

        {/* Address */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', fontSize: '14px', color: '#555' }}>
          <span style={{ flexShrink: 0 }}>📍</span>
          <span style={{ whiteSpace: 'pre-line' }}>{job.address || 'Alamat belum diisi'}</span>
        </div>

        {/* Job description */}
        {job.description && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
            <div style={{ fontSize: '11px', color: '#999' }}>Pekerjaan</div>
            {job.description}
          </div>
        )}

        {/* Needed date */}
        <div style={{ marginTop: '10px', fontSize: '13px' }}>
          <div style={{ fontSize: '11px', color: '#999' }}>Dibutuhkan</div>
          <div style={{ color: '#666' }}>{formatDate(job.date_needed)}</div>
        </div>

        {/* Actions */}
        {!completed && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {customerPhone && (
                <button
                  className="btn"
                  style={{
                    flex: 1, background: '#0f6e56', color: 'white', border: 'none',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                  onClick={() => openWhatsApp(job)}
                >
                  💬 Hubungi Pelanggan
                </button>
              )}
              {job.address && (
                <button className="btn btn-gray" style={{ flexShrink: 0 }} onClick={() => openMaps(job.address)}>
                  📍 Maps
                </button>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setShowDeliveryOrder(job.id)}
              >
                Tandai Selesai
              </button>
            </div>
          </>
        )}

        {completed && (
          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-secondary" onClick={() => setShowRatingForm(job.id)}>
              Beri Rating
            </button>
          </div>
        )}
      </div>
    )
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
            {jobs.map(job => isCustomer ? renderCustomerCard(job) : renderTukangCard(job))}
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
