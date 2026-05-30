import express from "express";
import upload from "../middleware/multer.js";
import { changeBookingStatus, checkAvailabilityOfCar, createBooking, getOwnerBookings, getUserBookings, confirmPayment, uploadOwnerDocuments } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar)
bookingRouter.post('/create', protect, upload.fields([
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'identityProof', maxCount: 1 }
]), createBooking)
bookingRouter.get('/user', protect, getUserBookings)
bookingRouter.get('/owner', protect, getOwnerBookings)
bookingRouter.post('/confirm-payment', protect, confirmPayment)
bookingRouter.post('/change-status', protect, changeBookingStatus)
bookingRouter.post('/owner-upload-docs', protect, upload.fields([
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'identityProof', maxCount: 1 }
]), uploadOwnerDocuments)

export default bookingRouter;