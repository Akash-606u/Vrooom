import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    pickupDate: {type: Date, required: true},
    returnDate: {type: Date, required: true},
    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
    price: {type: Number, required: true},
    paymentOption: {type: String, enum: ["pay_at_pickup", "pay_now", "online"], default: "pay_at_pickup"},
    paymentGateway: {type: String, enum: ["cash", "stripe", "razorpay"], default: "cash"},
    paymentStatus: {type: String, enum: ["pending", "paid", "failed"], default: "pending"},
    paymentId: {type: String, default: ""},
    paymentInfo: {type: Object, default: {}},
    userDocuments: {
        drivingLicense: {type: String, default: ""},
        identityProof: {type: String, default: ""}
    },
    ownerDocuments: {
        drivingLicense: {type: String, default: ""},
        identityProof: {type: String, default: ""}
    }
},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking