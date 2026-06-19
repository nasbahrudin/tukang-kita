export default function JobCard({ job, onClick }) {
  const truncateText = (text, length) => {
    return text?.length > length ? text.substring(0, length) + '...' : text
  }

  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-card-header">
        <div>
          <div className="job-type">{job.job_type}</div>
          <div className="job-address">{job.address}</div>
        </div>
        <div className="job-date">
          {new Date(job.date_needed).toLocaleDateString('id-ID')}
        </div>
      </div>
      <div className="job-description">
        {truncateText(job.description, 100)}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
        Lihat Detail
      </button>
    </div>
  )
}
