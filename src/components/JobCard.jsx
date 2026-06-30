export default function JobCard({ job, onClick }) {
  const truncateText = (text, length) => {
    return text?.length > length ? text.substring(0, length) + '...' : text
  }

  const openInMaps = (e) => {
    e.stopPropagation()
    const query = encodeURIComponent(job.address || '')
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  // --- Acceptance state ---------------------------------------------------
  // job.assignments comes from getAvailableJobs (job_assignments join).
  // Each entry: { sequence, accepted_at, tukang: { name } }
  const assignments = job.assignments || []
  const acceptedCount = assignments.length
  const tukangNeeded = job.tukang_needed || 1

  // Name of the first tukang who accepted (sorted by sequence, lowest first)
  const firstTukang = [...assignments].sort(
    (a, b) => (a.sequence || 0) - (b.sequence || 0)
  )[0]
  const firstTukangName = firstTukang?.tukang?.name

  const isTaken = acceptedCount > 0
  const isFull = job.status === 'accepted' || acceptedCount >= tukangNeeded
  const slotsLeft = Math.max(tukangNeeded - acceptedCount, 0)

  // --- Styles for the three states ---------------------------------------
  const cardStyle = isFull ? { opacity: 0.6 } : undefined

  return (
    <div className="job-card" onClick={isFull ? undefined : onClick} style={cardStyle}>
      <div className="job-card-header">
        <div>
          <div className="job-type">{job.job_type}</div>
        </div>
        <div className="job-date">
          {new Date(job.date_needed).toLocaleDateString('id-ID')}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '8px 0' }}>
        <span style={{ flexShrink: 0, lineHeight: 1.4 }}>📍</span>
        <span style={{ color: '#555', fontSize: '14px', lineHeight: 1.4 }}>
          {job.address || 'Alamat belum diisi'}
        </span>
      </div>

      <div className="job-description">
        {truncateText(job.description, 100)}
      </div>

      {/* Acceptance indicator */}
      {isTaken && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '10px',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            background: isFull ? '#f1efe8' : '#e1f5ee',
            color: isFull ? '#5f5e5a' : '#0f6e56',
          }}
        >
          <span>{isFull ? '✓' : '👷'}</span>
          <span>
            Diterima oleh {firstTukangName || 'tukang'}
            {!isFull && slotsLeft > 0 ? ` · butuh ${slotsLeft} lagi` : ''}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {job.address && !isFull && (
          <button
            className="btn btn-gray"
            style={{ flexShrink: 0 }}
            onClick={openInMaps}
          >
            📍 Buka di Maps
          </button>
        )}
        {isFull ? (
          <button className="btn btn-gray" style={{ flex: 1 }} disabled>
            Sudah Diambil
          </button>
        ) : (
          <button className="btn btn-primary" style={{ flex: 1 }}>
            Lihat Detail
          </button>
        )}
      </div>
    </div>
  )
}
