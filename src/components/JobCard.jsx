export default function JobCard({ job, onClick }) {
  const truncateText = (text, length) => {
    return text?.length > length ? text.substring(0, length) + '...' : text
  }

  const openInMaps = (e) => {
    e.stopPropagation()
    const query = encodeURIComponent(job.address || '')
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  return (
    <div className="job-card" onClick={onClick}>
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

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {job.address && (
          <button
            className="btn btn-gray"
            style={{ flexShrink: 0 }}
            onClick={openInMaps}
          >
            📍 Buka di Maps
          </button>
        )}
        <button className="btn btn-primary" style={{ flex: 1 }}>
          Lihat Detail
        </button>
      </div>
    </div>
  )
}