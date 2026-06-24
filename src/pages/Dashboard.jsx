import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import TrustStrip from '../components/TrustStrip'

export default function Dashboard({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!user?.verified) {
    return (
      <div>
        <Header user={user} onLogout={handleLogout} />
        <div className="container" style={{ marginTop: '40px' }}>
          <div className="pending-badge" style={{ display: 'inline-block' }}>
            Menunggu Verifikasi
          </div>
          <p style={{ marginTop: '16px', color: '#666' }}>
            Akun Anda menunggu verifikasi dari admin. Anda akan menerima pesan WhatsApp sesuai nomor terdaftar.
          </p>
          <p style={{ marginTop: '12px', color: '#888', fontSize: '13px' }}>
            Tim kami akan memverifikasi dalam waktu 24 jam.
          </p>
          <div style={{ marginTop: '24px' }}>
            <TrustStrip variant="grid" />
          </div>
        </div>
      </div>
    )
  }

  const isTukang = user?.role === 'tukang'
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase()

  const roleLabel = isTukang ? 'Tukang' : 'Pelanggan'
  const greeting = isTukang
    ? 'Siap kerja hari ini? Ada permintaan menunggu kamu.'
    : 'Mau minta bantuan apa hari ini? Pilih di bawah ya.'

  const cards = isTukang
    ? [
        { title: 'Cari Pekerjaan (Loker)', desc: 'Lihat pekerjaan tersedia di dekat kamu', to: '/loker', primary: true },
        { title: 'Pekerjaan Saya', desc: 'Pekerjaan yang kamu terima', to: '/my-jobs', primary: false },
      ]
    : [
        { title: 'Minta Bantuan Baru', desc: 'Pasang permintaan, orang siap membantu kamu', to: '/post-job', primary: true },
        { title: 'Bantuan Saya', desc: 'Pantau status permintaan kamu', to: '/my-jobs', primary: false },
      ]

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="container" style={{ marginTop: '32px', maxWidth: '520px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--brand-tint)', color: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: '18px', flexShrink: 0
          }}>
            {initial}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Halo, {user?.name}!</h2>
            <span style={{
              display: 'inline-block', marginTop: '4px',
              background: 'var(--brand-tint)', color: 'var(--brand)',
              fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '20px'
            }}>
              {roleLabel}
            </span>
          </div>
        </div>

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          {greeting}
        </p>

        <TrustStrip variant="grid" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cards.map((card) => (
            <div
              key={card.to}
              onClick={() => navigate(card.to)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'white', border: '1px solid #eee', borderRadius: '10px',
                padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
                background: card.primary ? 'var(--brand)' : 'var(--brand-tint)',
                color: card.primary ? 'white' : 'var(--brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 600
              }}>
                {card.primary ? '+' : '☰'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#333' }}>{card.title}</div>
                <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>{card.desc}</div>
              </div>
              <div style={{ color: '#bbb', fontSize: '20px' }}>›</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}