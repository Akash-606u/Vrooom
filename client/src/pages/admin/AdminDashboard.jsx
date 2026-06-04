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

    const revenueAmount = dashboardData.revenue?.total ?? 0;
    const recentBookings = dashboardData.recentActivities?.recentBookings ?? [];

    return (
        <AdminLayout>
            <div className="dashboard-container">
                <div className="dashboard-hero">
                    <div>
                        <p className="hero-label">Admin Dashboard</p>
                        <h2>Monitor performance at a glance</h2>
                        <p className="hero-description">Quickly review all active cars, bookings status, revenue and latest customer activity in one clean view.</p>
                    </div>
                </div>

                <div className="summary-grid">
                    <div className="summary-card blue">
                        <div>
                            <p>Total Cars</p>
                            <strong>{dashboardData.cars.total}</strong>
                        </div>
                        <div className="card-icon">🚗</div>
                    </div>
                    <div className="summary-card violet">
                        <div>
                            <p>Total Bookings</p>
                            <strong>{dashboardData.bookings.total}</strong>
                        </div>
                        <div className="card-icon">📅</div>
                    </div>
                    <div className="summary-card yellow">
                        <div>
                            <p>Pending</p>
                            <strong>{dashboardData.bookings.pending}</strong>
                        </div>
                        <div className="card-icon">⏳</div>
                    </div>
                    <div className="summary-card green">
                        <div>
                            <p>Confirmed</p>
                            <strong>{dashboardData.bookings.confirmed}</strong>
                        </div>
                        <div className="card-icon">✅</div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <section className="panel panel-bookings">
                        <div className="panel-header">
                            <div>
                                <h3>Recent Bookings</h3>
                                <p>Latest customer reservations</p>
                            </div>
                            <span className="panel-badge">{recentBookings.length} latest</span>
                        </div>

                        <div className="booking-list">
                            {recentBookings.length > 0 ? (
                                recentBookings.map((booking) => (
                                    <div key={booking._id} className="booking-row">
                                        <div>
                                            <p className="booking-title">{booking.car?.brand ?? 'Car'} {booking.car?.model ?? ''}</p>
                                            <p className="booking-meta">{booking.user?.name ?? 'Guest'}</p>
                                        </div>
                                        <div className="booking-right">
                                            <p className="booking-price">₹{booking.totalAmount ?? booking.price ?? '0'}</p>
                                            <span className={`status-pill ${booking.status}`}>{booking.status ?? 'unknown'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No recent bookings available.</p>
                            )}
                        </div>
                    </section>

                    <section className="panel panel-revenue">
                        <div className="panel-header">
                            <div>
                                <h3>Monthly Revenue</h3>
                                <p>Revenue from all confirmed bookings</p>
                            </div>
                        </div>

                        <div className="revenue-card">
                            <div>
                                <p>Current month</p>
                                <strong>₹{Number(revenueAmount).toLocaleString()}</strong>
                            </div>
                            <div className="revenue-icon">💰</div>
                        </div>

                        <div className="revenue-summary">
                            <div>
                                <span>Total Bookings</span>
                                <strong>{dashboardData.bookings.total}</strong>
                            </div>
                            <div>
                                <span>Confirmed</span>
                                <strong>{dashboardData.bookings.confirmed}</strong>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
