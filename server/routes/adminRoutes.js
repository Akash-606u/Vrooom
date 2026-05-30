import express from "express";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import {
    // Car approval endpoints
    getPendingCars,
    getAllCars,
    approveCar,
    rejectCar,
    deleteCar,
    // Booking management endpoints
    getAllBookings,
    updateBookingStatus,
    // Analytics endpoints
    getDashboardStats,
    getAnalyticsData,
    // User management endpoints
    getAllUsers,
    getUserDetails,
    toggleUserStatus
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Apply protect middleware to all routes and roleCheck for admin
adminRouter.use(protect, roleCheck(["admin"]));

// ===== CAR APPROVAL ROUTES =====
adminRouter.get("/cars/pending", getPendingCars);
adminRouter.get("/cars/all", getAllCars);
adminRouter.put("/cars/approve", approveCar);
adminRouter.put("/cars/reject", rejectCar);
adminRouter.delete("/cars/delete", deleteCar);

// ===== BOOKING MANAGEMENT ROUTES =====
adminRouter.get("/bookings", getAllBookings);
adminRouter.put("/bookings/status", updateBookingStatus);

// ===== ANALYTICS & DASHBOARD ROUTES =====
adminRouter.get("/dashboard", getDashboardStats);
adminRouter.get("/analytics", getAnalyticsData);

// ===== USER MANAGEMENT ROUTES =====
adminRouter.get("/users", getAllUsers);
adminRouter.post("/users/details", getUserDetails);
adminRouter.post("/users/status", toggleUserStatus);

export default adminRouter;
