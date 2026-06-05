import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyCarData } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const CarDetails = () => {

  const { id } = useParams()

  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [paymentOption, setPaymentOption] = useState('pay_at_pickup')
  const [paymentGateway, setPaymentGateway] = useState('stripe')
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null)
  const [identityProofFile, setIdentityProofFile] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const currency = import.meta.env.VITE_CURRENCY

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!drivingLicenseFile || !identityProofFile) {
      toast.error('Please upload both driving license and identity proof before booking.')
      return
    }

    try {
      setBookingLoading(true)
      const formData = new FormData()
      formData.append('car', id)
      formData.append('pickupDate', pickupDate)
      formData.append('returnDate', returnDate)
      formData.append('paymentOption', paymentOption)
      formData.append('paymentGateway', paymentOption === 'pay_at_pickup' ? 'cash' : paymentGateway)
      formData.append('drivingLicense', drivingLicenseFile)
      formData.append('identityProof', identityProofFile)

      const { data } = await axios.post('/api/bookings/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (!data.success) {
        toast.error(data.message)
        return
      }

      if (data.paymentGateway === 'stripe' && data.sessionUrl) {
        window.location.href = data.sessionUrl
        return
      }

      if (data.paymentGateway === 'razorpay' && data.order) {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          toast.error('Unable to load Razorpay checkout. Please try again.')
          return
        }

        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency,
          name: `${car.brand} ${car.model}`,
          description: 'Car booking payment',
          order_id: data.order.id,
          handler: async (response) => {
            try {
              const token = localStorage.getItem('token')
              const confirm = await axios.post('/api/bookings/confirm-payment', {
                bookingId: data.bookingId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }, {
                headers: { Authorization: token }
              })
              if (confirm.data.success) {
                toast.success(confirm.data.message)
                navigate('/my-bookings')
              } else {
                toast.error(confirm.data.message)
              }
            } catch (confirmError) {
              toast.error(confirmError.message)
            }
          },
          modal: {
            ondismiss: () => toast.error('Payment cancelled or not completed.')
          }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
        return
      }

      toast.success(data.message)
      navigate('/my-bookings')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    setCar(cars.find(car => car._id === id))
  }, [cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Car Image & Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className='lg:col-span-2'>
          <motion.img
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}

            src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <motion.div className='space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
            </div>
            <hr className='border-borderColor my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}

                  key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {/* Features */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {
                  ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>
                  ))
                }
              </ul>
            </div>

          </motion.div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}

          onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p>

          <hr className='border-borderColor my-6' />

          <div className='flex flex-col gap-2'>
            <label htmlFor="pickup-date">Pickup Date</label>
            <input value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date' />
          </div>

          <div className='space-y-3'>
            <p className='font-medium'>Payment Options</p>
            <label className='flex items-center gap-3'>
              <input type='radio' name='paymentOption' value='pay_at_pickup' checked={paymentOption === 'pay_at_pickup'} onChange={() => setPaymentOption('pay_at_pickup')} />
              Pay at pickup
            </label>
            <label className='flex items-center gap-3'>
              <input type='radio' name='paymentOption' value='pay_now' checked={paymentOption === 'pay_now'} onChange={() => setPaymentOption('pay_now')} />
              Pay now online
            </label>
            {paymentOption === 'pay_now' && (
              <div className='pl-6 space-y-2'>
                <label className='flex items-center gap-3'>
                  <input type='radio' name='paymentGateway' value='stripe' checked={paymentGateway === 'stripe'} onChange={() => setPaymentGateway('stripe')} />
                  Stripe
                </label>
                <label className='flex items-center gap-3'>
                  <input type='radio' name='paymentGateway' value='razorpay' checked={paymentGateway === 'razorpay'} onChange={() => setPaymentGateway('razorpay')} />
                  Razorpay
                </label>
              </div>
            )}
          </div>

          <div className='space-y-4 p-4 border border-borderColor rounded-xl bg-gray-50'>
            <p className='font-semibold text-gray-800'>Document Verification</p>
            <p className='text-sm text-gray-500'>Upload a valid driving license and identity proof (Aadhaar / PAN). Without these documents, the car cannot be released at pickup.</p>
            <div className='grid gap-4'>
              <label className='flex flex-col gap-2 text-sm'>
                Driving License
                <input type='file' accept='image/*,.pdf' onChange={(e) => setDrivingLicenseFile(e.target.files[0] || null)} className='w-full border border-borderColor rounded-lg px-3 py-2 overflow-hidden' />
              </label>
              <label className='flex flex-col gap-2 text-sm'>
                Identity Proof
                <input type='file' accept='image/*,.pdf' onChange={(e) => setIdentityProofFile(e.target.files[0] || null)} className='w-full border border-borderColor rounded-lg px-3 py-2 overflow-hidden' />
              </label>
            </div>
          </div>

          <button disabled={bookingLoading} className='w-full bg-primary hover:bg-primary-dull disabled:bg-blue-400 transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>
            {bookingLoading ? 'Booking...' : 'Book Now'}
          </button>

          <p className='text-center text-sm'>No credit card required to reserve</p>

        </motion.form>
      </div>

    </div>
  ) : <Loader />
}

export default CarDetails
