import { useNavigate, useLocation } from 'react-router-dom'

export default function Header({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const isDashboard = path === '/dashboard' || path === '/'

  // Route → page title. /my-jobs is role-aware.
  const titleFor = () => {
    if (path.startsWith('/post-job')) return 'Minta Bantuan'
    if (path.startsWith('/loker')) return 'Loker'
    if (path.startsWith('/job/')) return 'Detail Pekerjaan'
    if (path.startsWith('/my-jobs')) {
      return user?.role === 'tukang' ? 'Pekerjaan Saya' : 'Bantuan Saya'
    }
    return 'Tukang Kita'
  }

  // True "previous page". If there's no history to go back to (e.g. landed
  // here via a direct link / refresh), fall back to the dashboard so it
  // never dead-ends.
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isDashboard && (
          <button
            aria-label="Kembali"
            onClick={goBack}
            style={{
              background: 'rgba(255,255,255,0.18)', color: 'white', border: 'none',
              width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', lineHeight: 1, flexShrink: 0
            }}
          >
            ‹
          </button>
        )}
        <h1 style={{ margin: 0, cursor: isDashboard ? 'default' : 'pointer' }}
            onClick={() => !isDashboard && navigate('/dashboard')}>
          {isDashboard ? 'Tukang Kita' : titleFor()}
        </h1>
      </div>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ color: 'white', fontSize: '14px' }}>{user?.name}</span>
        <button className="btn"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer' }}
          onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
