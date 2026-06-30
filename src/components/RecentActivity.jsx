import { useState, useEffect } from 'react'
import { getRecentActivity } from '../lib/supabase'

export default function RecentActivity() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getRecentActivity().then(res => {
      if (active) {
        setItems(res.activity || [])
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  // Don't render the band at all if there's nothing to show
  if (loading || items.length === 0) return null

  const timeLabel = (daysAgo) => {
    if (daysAgo <= 0) return 'hari ini'
    if (daysAgo === 1) return '1 hari lalu'
    return `${daysAgo} hari lalu`
  }

  return (
    <div style={{
      background: 'white', border: '1px solid #eee', borderRadius: '10px',
      padding: '16px', marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#1d9e75', display: 'inline-block'
        }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
          Aktivitas terbaru di Batam
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((it, i) => {
          const initial = (it.tukang || '?').trim().charAt(0).toUpperCase()
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#e1f5ee', color: '#0f6e56', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 600
              }}>{initial}</div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.4 }}>
                <strong style={{ color: '#333', fontWeight: 600 }}>{it.tukang}</strong>
                {' mengambil '}
                <strong style={{ color: '#333', fontWeight: 600 }}>{it.job_type}</strong>
                {' di '}{it.area}
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap'
              }}>
                {timeLabel(it.days_ago)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
