import { Link } from 'react-router-dom'

export default function Header({ user, onLogout }) {
  return (
    <div className="header">
      <h1>Tukang Kita</h1>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
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
