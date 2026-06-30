import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP

export default function DeliveryOrder({ jobId, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)

    const { data: existingOrder } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('booking_id', jobId)
      .single()

    if (!existingOrder) {
      await supabase.from('delivery_orders').insert({ booking_id: jobId, status: 'pending' })
    }

    await onConfirm()
    setLoading(false)
  }

  // Short, friendly reference instead of the raw UUID
  const shortRef = (jobId || '').split('-')[0].toUpperCase()

  const whatsappLink = `https://wa.me/${ADMIN_WHATSAPP}?text=Pekerjaan ID: ${jobId} selesai. Kirim foto hasilnya.`

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Surat Tanda Terima</h2>

        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <p><strong>Pesanan Kerja #:</strong> {shortRef}</p>
          <p style={{ marginTop: '12px' }}><strong>Status:</strong> Pekerjaan telah selesai</p>
          <p style={{ marginTop: '12px' }}>
            Dengan ini saya menyatakan bahwa pekerjaan telah selesai dilakukan sesuai dengan permintaan yang telah disepakati.
          </p>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Memproses...' : 'Konfirmasi Selesai'}
          </button>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary"
            style={{ flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Kirim Foto via WhatsApp
          </a>
        </div>

        <button className="btn btn-gray" onClick={onClose} style={{ width: '100%', marginTop: '12px' }}>
          Tutup
        </button>
      </div>
    </div>
  )
}
