import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import { motion } from 'motion/react'

const PaymentSuccess = () => {
  const { axios } = useAppContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [processing, setProcessing] = useState(true)
  const [status, setStatus] = useState('Confirming payment...')

  useEffect(()=>{
    const sessionId = searchParams.get('session_id')
    const bookingId = searchParams.get('bookingId')

    if (!sessionId || !bookingId) {
      toast.error('Missing payment confirmation details')
      navigate('/my-bookings')
      return
    }

    const confirm = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setStatus('Login required to complete payment confirmation.')
        toast.error('Login required to complete payment confirmation.')
        setProcessing(false)
        return
      }

      try {
        const { data } = await axios.post('/api/bookings/confirm-payment', {
          bookingId,
          stripeSessionId: sessionId
        }, {
          headers: { Authorization: token }
        })

        if (data.success) {
          setStatus('Payment confirmed successfully. Your booking is now confirmed.')
          toast.success(data.message)
        } else {
          setStatus(data.message || 'Could not confirm payment.')
          toast.error(data.message || 'Payment confirmation failed')
        }
      } catch (error) {
        setStatus(error.message)
        toast.error(error.message)
      } finally {
        setProcessing(false)
      }
    }

    confirm()
  }, [searchParams, axios, navigate])

  if (processing) return <Loader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='min-h-screen flex items-center justify-center px-6 md:px-16 lg:px-24 xl:px-32 mt-16'
    >
      <div className='w-full max-w-xl rounded-xl border border-borderColor p-8 bg-white shadow-lg text-gray-700'>
        <h1 className='text-3xl font-semibold mb-4'>Payment Status</h1>
        <p className='mb-6 text-gray-600'>{status}</p>
        <button
          onClick={() => navigate('/my-bookings')}
          className='bg-primary text-white px-5 py-3 rounded-xl hover:bg-primary-dull transition-all'
        >
          View My Bookings
        </button>
      </div>
    </motion.div>
  )
}

export default PaymentSuccess
