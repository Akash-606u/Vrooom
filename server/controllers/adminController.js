import Car from "../models/Car.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// ===== CAR APPROVAL ENDPOINTS =====

// Get all pending cars
export const getPendingCars = async (req, res) => {
    try {
        const cars = await Car.find({ approvalStatus: "pending" })
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all cars (admin view - including pending and rejected)
export const getAllCars = async (req, res) => {
    try {
        const { status, category, owner } = req.query;
        let filter = {};

        if (status) filter.approvalStatus = status;
        if (category) filter.category = category;
        if (owner) filter.owner = owner;

        const cars = await Car.find(filter)
            .populate('owner', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Approve a car
export const approveCar = async (req, res) => {
    try {
        const { carId } = req.body;
        const adminId = req.user._id;

        const car = await Car.findById(carId);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }

        if (car.approvalStatus !== "pending") {
            return res.json({ success: false, message: "Car is not pending approval" });
        }

        car.approvalStatus = "approved";
        car.approvedBy = adminId;
        car.approvalDate = new Date();
        await car.save();

        res.json({ success: true, message: "Car approved successfully", car });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Reject a car
export const rejectCar = async (req, res) => {
    try {
        const { carId, reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Rejection reason is required" });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }

        if (car.approvalStatus !== "pending") {
            return res.json({ success: false, message: "Car is not pending approval" });
        }

        car.approvalStatus = "rejected";
        car.rejectionReason = reason;
        car.approvedBy = req.user._id;
        car.approvalDate = new Date();
        await car.save();

        res.json({ success: true, message: "Car rejected", car });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete a car (admin only)
export const deleteCar = async (req, res) => {
    try {
        const { carId } = req.body;

        const car = await Car.findByIdAndDelete(carId);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }

        res.json({ success: true, message: "Car deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ===== BOOKING MANAGEMENT ENDPOINTS =====

// Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const { status, userId, ownerId } = req.query;
        let filter = {};

        if (status) filter.status = status;
        if (userId) filter.user = userId;
        if (ownerId) filter.owner = ownerId;

        const bookings = await Booking.find(filter)
            .populate('car')
            .populate('user', 'name email')
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body;

        if (!["pending", "confirmed", "cancelled"].includes(status)) {
            return res.json({ success: false, message: "Invalid booking status" });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        ).populate('car user owner');

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, message: "Booking status updated", booking });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ===== ANALYTICS & DASHBOARD ENDPOINTS =====

// Get admin dashboard data
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalOwners = await User.countDocuments({ role: "owner" });
        const totalCars = await Car.countDocuments();
        const approvedCars = await Car.countDocuments({ approvalStatus: "approved" });
        const pendingCars = await Car.countDocuments({ approvalStatus: "pending" });
        const rejectedCars = await Car.countDocuments({ approvalStatus: "rejected" });
        
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: "pending" });
        const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
        const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

        // Calculate total revenue from confirmed bookings
        const revenueData = await Booking.aggregate([
            { $match: { status: "confirmed" } },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
        ]);
        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        // Recent activities
        const recentCars = await Car.find()
            .populate('owner', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentBookings = await Booking.find()
            .populate('user', 'name')
            .populate('car', 'brand model')
            .sort({ createdAt: -1 })
            .limit(5);

        const dashboardData = {
            users: {
                total: totalUsers,
                owners: totalOwners,
                regularUsers: totalUsers
            },
            cars: {
                total: totalCars,
                approved: approvedCars,
                pending: pendingCars,
                rejected: rejectedCars
            },
            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                confirmed: confirmedBookings,
                cancelled: cancelledBookings
            },
            revenue: {
                total: totalRevenue
            },
            recentActivities: {
                recentCars,
                recentBookings
            }
        };

        res.json({ success: true, dashboardData });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get analytics data for charts
export const getAnalyticsData = async (req, res) => {
    try {
        // Bookings by month (last 12 months)
        const bookingsByMonth = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$price", 0] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ]);

        // Revenue by car category
        const revenueByCategory = await Booking.aggregate([
            {
                $lookup: {
                    from: "cars",
                    localField: "car",
                    foreignField: "_id",
                    as: "carData"
                }
            },
            { $unwind: "$carData" },
            {
                $group: {
                    _id: "$carData.category",
                    totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$price", 0] } },
                    bookings: { $sum: 1 }
                }
            }
        ]);

        // Car category distribution
        const carCategoryDistribution = await Car.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Booking status distribution
        const bookingStatusDistribution = await Booking.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const analyticsData = {
            bookingsByMonth: bookingsByMonth.map(item => ({
                month: `${item._id.month}/${item._id.year}`,
                bookings: item.count,
                revenue: item.revenue
            })),
            revenueByCategory,
            carCategoryDistribution,
            bookingStatusDistribution
        };

        res.json({ success: true, analyticsData });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ===== USER MANAGEMENT ENDPOINTS =====

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let filter = {};

        if (role) filter.role = role;

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get user details
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Get user's cars if owner
        let userCars = [];
        if (user.role === "owner") {
            userCars = await Car.find({ owner: userId });
        }

        // Get user's bookings
        const userBookings = await Booking.find({
            $or: [
                { user: userId },
                { owner: userId }
            ]
        }).populate('car').limit(5);

        res.json({
            success: true,
            user,
            cars: userCars,
            bookings: userBookings
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, message: "User status updated", user });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
