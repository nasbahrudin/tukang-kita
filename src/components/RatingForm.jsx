import { useState } from 'react'
import { supabase, addRating } from '../lib/supabase'

export default function RatingForm({ jobId, onClose }) {
  const [score, setScore] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: assignments } = await supabase
      .from('job_assignments')
      .select('tukang_id')
      .eq('booking_id', jobId)

    if (assignments && assignments[0]) {
      await addRating(jobId, assignments[0].tukang_id, score, feedback)
      alert('Rating berhasil dikirim!')
      onClose()
    } else {
      alert('Tidak dapat menemukan tukang untuk pekerjaan ini')
    }

    setLoading(false)
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Beri Rating</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating (1-5)</label>
            <select value={score} onChange={(e) => setScore(Number(e.target.value))}>
              <option value="1">1 - Buruk</option>
              <option value="2">2 - Cukup</option>
              <option value="3">3 - Baik</option>
              <option value="4">4 - Sangat Baik</option>
              <option value="5">5 - Sempurna</option>
            </select>
          </div>

          <div className="form-group">
            <label>Feedback (Opsional)</label>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Bagikan pengalaman Anda..." rows="4" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Mengirim...' : 'Kirim Rating'}
          </button>
        </form>

        <button className="btn btn-gray" onClick={onClose} style={{ width: '100%', marginTop: '12px' }}>
          Batal
        </button>
      </div>
    </div>
  )
}
