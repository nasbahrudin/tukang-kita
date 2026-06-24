export default function TrustStrip({ variant = 'band', role = 'customer' }) {
  const isTukang = role === 'tukang'

  const firstSignal = isTukang
    ? { icon: 'shield', title: 'Ada masalah? Tim kami bantu', sub: 'Kami dukung kamu kalau ada pelanggan sulit' }
    : { icon: 'shield', title: 'Tukang terverifikasi', sub: 'Diperiksa admin sebelum aktif' }

  const signals = [
    firstSignal,
    { icon: 'discount', title: '0% komisi untuk tukang', sub: 'Tukang terima penuh hasil kerjanya' },
    { icon: 'whatsapp', title: 'Bantuan WhatsApp', sub: 'Ada orang asli yang bantu kamu' },
    { icon: 'pin', title: 'Dibuat untuk Batam', sub: 'Fokus melayani warga Batam dulu' },
  ]

  const Icon = ({ name }) => {
    const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
    if (name === 'discount') return <svg {...common}><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="15" x2="15.01" y2="15"/><line x1="16" y1="8" x2="8" y2="16"/><circle cx="12" cy="12" r="10"/></svg>
    if (name === 'shield') return <svg {...common}><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
    if (name === 'whatsapp') return <svg {...common}><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z"/></svg>
    if (name === 'pin') return <svg {...common}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
    return null
  }

  if (variant === 'band') {
    return (
      <div style={{ background: 'var(--brand)', borderRadius: '10px', padding: '10px 12px', display: 'flex', gap: '14px', justifyContent: 'space-between', flexWrap: 'wrap', margin: '0 0 16px' }}>
        {signals.map((s) => (
          <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBEAF0', fontSize: '11px' }}>
            <span style={{ color: '#F4C0D1', display: 'flex' }}><Icon name={s.icon} /></span>
            {s.title}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '0 0 16px' }}>
      {signals.map((s) => (
        <div key={s.title} style={{ border: '0.5px solid #e5e2da', borderRadius: '10px', padding: '12px', background: '#fff' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#FBEAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: 'var(--brand)' }}>
            <Icon name={s.icon} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{s.title}</div>
          <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
}