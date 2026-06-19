import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'

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
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="container" style={{ marginTop: '40px' }}>
        <h2>Selamat datang, {user?.name}!</h2>

        {user?.role === 'customer' && (
          <div>
            <p style={{ marginTop: '16px', color: '#666' }}>
              Anda login sebagai <strong>Pelanggan</strong>
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/post-job')} style={{ marginTop: '16px' }}>
              Buat Pekerjaan Baru
            </button>
            <button className="btn btn-gray" onClick={() => navigate('/my-jobs')} style={{ marginTop: '8px', marginLeft: '8px' }}>
              Lihat Pekerjaan Saya
            </button>
          </div>
        )}

        {user?.role === 'tukang' && (
          <div>
            <p style={{ marginTop: '16px', color: '#666' }}>
              Anda login sebagai <strong>Tukang</strong>
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/loker')} style={{ marginTop: '16px' }}>
              Lihat Pekerjaan Tersedia (Loker)
            </button>
            <button className="btn btn-gray" onClick={() => navigate('/my-jobs')} style={{ marginTop: '8px', marginLeft: '8px' }}>
              Pekerjaan Saya
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
