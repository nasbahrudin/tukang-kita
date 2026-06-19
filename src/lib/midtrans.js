export const initMidtrans = () => {
  const script = document.createElement('script')
  script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
  script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY)
  script.onload = () => {
    console.log('Midtrans Snap loaded')
  }
  document.head.appendChild(script)
}

export const processPayment = (snapToken, onSuccess, onError) => {
  if (!window.snap) {
    console.error('Midtrans Snap not loaded')
    onError('Midtrans not loaded')
    return
  }

  window.snap.pay(snapToken, {
    onSuccess: (result) => {
      console.log('Payment success:', result)
      onSuccess(result)
    },
    onPending: (result) => {
      console.log('Payment pending:', result)
    },
    onError: (error) => {
      console.error('Payment error:', error)
      onError(error)
    },
    onClose: () => {
      console.log('Payment dialog closed')
    },
  })
}

export default {
  initMidtrans,
  processPayment,
}
