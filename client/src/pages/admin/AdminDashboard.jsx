import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
                headers: { Authorization: token }
            });
            if (response.data.success) {
                setDashboardData(response.data.dashboardData);
            } else {
                setError('Failed to fetch dashboard data');
            }
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;
    if (!dashboardData) return <AdminLayout><div className="loading">No data</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="dashboard-container">
                <h1 className="page-title">Dashboard Overview</h1>

                {/* User Statistics */}
                <section className="stats-section">
                    <h2>User Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>Total Users</h3>
                                <p className="stat-value">{dashboardData.users.total}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👔</div>
                            <div className="stat-content">
                                <h3>Total Owners</h3>
                                <p className="stat-value">{dashboardData.users.owners}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👤</div>
                            <div className="stat-content">
                                <h3>Regular Users</h3>
                                <p className="stat-value">{dashboardData.users.regularUsers}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Car Statistics */}
                <section className="stats-section">
                    <h2>Car Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🚗</div>
                            <div className="stat-content">
                                <h3>Total Cars</h3>
                                <p className="stat-value">{dashboardData.cars.total}</p>
                            </div>
                        </div>
                        <div className="stat-card approved">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <h3>Approved Cars</h3>
                                <p className="stat-value">{dashboardData.cars.approved}</p>
                            </div>
                        </div>
                        <div className="stat-card pending">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3>Pending Approval</h3>
                                <p className="stat-value">{dashboardData.cars.pending}</p>
                            </div>
                        </div>
                        <div className="stat-card rejected">
                            <div className="stat-icon">❌</div>
                            <div className="stat-content">
                                <h3>Rejected Cars</h3>
                                <p className="stat-value">{dashboardData.cars.rejected}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Booking Statistics */}
                <section className="stats-section">
                    <h2>Booking Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📅</div>
                            <div className="stat-content">
                                <h3>Total Bookings</h3>
                                <p className="stat-value">{dashboardData.bookings.total}</p>
                            </div>
                        </div>
                        <div className="stat-card pending">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3>Pending</h3>
                                <p className="stat-value">{dashboardData.bookings.pending}</p>
                            </div>
                        </div>
                        <div className="stat-card approved">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <h3>Confirmed</h3>
                                <p className="stat-value">{dashboardData.bookings.confirmed}</p>
                            </div>
                        </div>
                        <div className="stat-card rejected">
                            <div className="stat-icon">❌</div>
                            <div className="stat-content">
                                <h3>Cancelled</h3>
                                <p className="stat-value">{dashboardData.bookings.cancelled}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Revenue */}
                <section className="stats-section">
                    <h2>Revenue</h2>
                    <div className="stats-grid">
                        <div className="stat-card large">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <h3>Total Revenue</h3>
                                <p className="stat-value">₹{dashboardData.revenue.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activities */}
                <section className="recent-activities">
                    <h2>Recent Activities</h2>
                    
                    <div className="activity-section">
                        <h3>Recent Cars Added</h3>
                        <div className="activity-list">
                            {dashboardData.recentActivities.recentCars.length > 0 ? (
                                dashboardData.recentActivities.recentCars.map(car => (
                                    <div key={car._id} className="activity-item">
                                        <div className="activity-info">
                                            <p className="activity-title">{car.brand} {car.model}</p>
                                            <p className="activity-detail">Owner: {car.owner?.name}</p>
                                            <p className="activity-detail">Status: <span className={`status ${car.approvalStatus}`}>{car.approvalStatus}</span></p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No recent cars</p>
                            )}
                        </div>
                    </div>

                    <div className="activity-section">
                        <h3>Recent Bookings</h3>
                        <div className="activity-list">
                            {dashboardData.recentActivities.recentBookings.length > 0 ? (
                                dashboardData.recentActivities.recentBookings.map(booking => (
                                    <div key={booking._id} className="activity-item">
                                        <div className="activity-info">
                                            <p className="activity-title">{booking.car?.brand} {booking.car?.model}</p>
                                            <p className="activity-detail">User: {booking.user?.name}</p>
                                            <p className="activity-detail">Status: <span className={`status ${booking.status}`}>{booking.status}</span></p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No recent bookings</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
