import Booking from "../models/Booking.js"
import Car from "../models/Car.js";
import imagekit from "../configs/imageKit.js"
import fs from "fs"
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const uploadToImageKit = async (file, folder = '/documents') => {
    const fileBuffer = fs.readFileSync(file.path)
    const response = await imagekit.upload({
        file: fileBuffer,
        fileName: file.originalname,
        folder
    })

    return imagekit.url({
        path: response.filePath,
        transformation: [
            { width: '1280' },
            { quality: 'auto' }
        ]
    })
}

const razorpaySignatureIsValid = ({order_id, payment_id, signature}) => {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex")

    return generatedSignature === signature;
}

// Function to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    })
    return bookings.length === 0;
}

// API to Check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res)=>{
    try {
        const {location, pickupDate, returnDate} = req.body

        // fetch all available cars for the given location
        const cars = await Car.find({location, isAvaliable: true})

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car)=>{
           const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
           return {...car._doc, isAvailable: isAvailable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true)

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Create Booking
export const createBooking = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {car, pickupDate, returnDate, paymentOption = 'pay_at_pickup', paymentGateway = 'cash'} = req.body;

        const drivingLicenseFile = req.files?.drivingLicense?.[0]
        const identityProofFile = req.files?.identityProof?.[0]

        if(!drivingLicenseFile || !identityProofFile){
            return res.json({ success: false, message: 'Driving license and identity proof are required to book a car.' })
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)
        if(!isAvailable){
            return res.json({success: false, message: "Car is not available"})
        }

        const carData = await Car.findById(car)

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.max(1, Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)))
        const price = carData.pricePerDay * noOfDays;

        const drivingLicenseUrl = await uploadToImageKit(drivingLicenseFile, '/documents')
        const identityProofUrl = await uploadToImageKit(identityProofFile, '/documents')

        const booking = await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            paymentOption,
            paymentGateway: paymentOption === 'pay_at_pickup' ? 'cash' : paymentGateway,
            paymentStatus: 'pending',
            paymentInfo: {},
            userDocuments: {
                drivingLicense: drivingLicenseUrl,
                identityProof: identityProofUrl
            }
        })

        if(paymentOption === 'pay_at_pickup'){
            return res.json({success: true, message: "Booking created. Pay at pickup.", bookingId: booking._id})
        }

        if(paymentGateway === 'stripe'){
            const clientURL = process.env.CLIENT_URL || "http://localhost:5173"
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'INR',
                        product_data: { name: `${carData.brand} ${carData.model}` },
                        unit_amount: Math.round(price * 100)
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: `${clientURL}/payment-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking._id}`,
                cancel_url: `${clientURL}/car-details/${car}`,
                metadata: { bookingId: booking._id.toString() }
            })

            booking.paymentGateway = 'stripe'
            booking.paymentInfo = { sessionId: session.id }
            await booking.save()

            return res.json({
                success: true,
                message: "Booking created. Redirecting to Stripe...",
                paymentGateway: 'stripe',
                sessionUrl: session.url,
                bookingId: booking._id
            })
        }

        if(paymentGateway === 'razorpay'){
            const order = await razorpay.orders.create({
                amount: Math.round(price * 100),
                currency: 'INR',
                receipt: `booking_${booking._id}`,
                payment_capture: 1
            })

            booking.paymentGateway = 'razorpay'
            booking.paymentInfo = { orderId: order.id }
            await booking.save()

            return res.json({
                success: true,
                message: "Booking created. Redirecting to Razorpay...",
                paymentGateway: 'razorpay',
                order: {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt
                },
                key: process.env.RAZORPAY_KEY_ID,
                bookingId: booking._id
            })
        }

        res.json({success: false, message: 'Unsupported payment gateway'})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const confirmPayment = async (req, res) => {
    try {
        const {_id} = req.user;
        const { bookingId, stripeSessionId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        const booking = await Booking.findById(bookingId)
        if(!booking){
            return res.json({ success: false, message: 'Booking not found' })
        }
        if(booking.user.toString() !== _id.toString()){
            return res.json({ success: false, message: 'Unauthorized' })
        }

        if(booking.paymentGateway === 'stripe'){
            if(!stripeSessionId){
                return res.json({ success: false, message: 'Missing stripe session id' })
            }

            const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
            if(session.payment_status !== 'paid'){
                return res.json({ success: false, message: 'Stripe payment not completed' })
            }

            booking.paymentStatus = 'paid'
            booking.status = 'confirmed'
            booking.paymentId = session.payment_intent
            booking.paymentInfo = { ...booking.paymentInfo, sessionId: session.id, paymentIntentId: session.payment_intent }
            await booking.save()

            return res.json({ success: true, message: 'Payment confirmed and booking updated.' })
        }

        if(booking.paymentGateway === 'razorpay'){
            if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
                return res.json({ success: false, message: 'Missing Razorpay payment details' })
            }

            const valid = razorpaySignatureIsValid({
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
                signature: razorpay_signature
            })

            if(!valid){
                return res.json({ success: false, message: 'Razorpay signature verification failed' })
            }

            booking.paymentStatus = 'paid'
            booking.status = 'confirmed'
            booking.paymentId = razorpay_payment_id
            booking.paymentInfo = { ...booking.paymentInfo, orderId: razorpay_order_id, signature: razorpay_signature }
            await booking.save()

            return res.json({ success: true, message: 'Razorpay payment confirmed and booking updated.' })
        }

        res.json({ success: false, message: 'No payment confirmation needed for this booking.' })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const uploadOwnerDocuments = async (req, res) => {
    try {
        if(req.user.role !== 'owner'){
            return res.json({ success: false, message: 'Unauthorized' })
        }

        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.json({ success: false, message: 'Booking not found' })
        }
        if(booking.owner.toString() !== req.user._id.toString()){
            return res.json({ success: false, message: 'Unauthorized' })
        }

        const drivingLicenseFile = req.files?.drivingLicense?.[0]
        const identityProofFile = req.files?.identityProof?.[0]

        if(!drivingLicenseFile || !identityProofFile){
            return res.json({ success: false, message: 'Both driving license and identity proof are required.' })
        }

        const drivingLicenseUrl = await uploadToImageKit(drivingLicenseFile, '/documents')
        const identityProofUrl = await uploadToImageKit(identityProofFile, '/documents')

        booking.ownerDocuments = {
            drivingLicense: drivingLicenseUrl,
            identityProof: identityProofUrl
        }
        await booking.save()

        res.json({ success: true, message: 'Pickup documents uploaded. Do not release the car without verifying these documents.' })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// API to List User Bookings 
export const getUserBookings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get Owner Bookings

export const getOwnerBookings = async (req, res)=>{
    try {
        if(req.user.role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({owner: req.user._id}).populate('car user').select("-user.password").sort({createdAt: -1 })
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to change booking status
export const changeBookingStatus = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body

        const booking = await Booking.findById(bookingId)

        if(booking.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized"})
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}