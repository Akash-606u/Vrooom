import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/admin-analytics.css';

const AdminAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                '/api/admin/analytics',
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setAnalyticsData(response.data.analyticsData);
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
    if (!analyticsData) return <AdminLayout><div className="loading">No data</div></AdminLayout>;

    const totalBookings = analyticsData.bookingStatusDistribution.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = analyticsData.revenueByCategory.reduce((sum, item) => sum + item.totalRevenue, 0);

    return (
        <AdminLayout>
            <div className="analytics-container">
                <div className="page-hero">
                    <div>
                        <p className="hero-label">Analytics</p>
                        <h1 className="page-title">Analytics & Reports</h1>
                        <p className="hero-description">Explore top trends, revenue breakdowns, and category performance across the car rental marketplace.</p>
                    </div>
                </div>

                <div className="status-grid analytics-summary-grid">
                    <div className="status-card blue">
                        <p>Total Revenue</p>
                        <strong>₹{totalRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="status-card violet">
                        <p>Total Bookings</p>
                        <strong>{totalBookings}</strong>
                    </div>
                    <div className="status-card green">
                        <p>Confirmed</p>
                        <strong>{analyticsData.bookingStatusDistribution.find(i => i._id === 'confirmed')?.count || 0}</strong>
                    </div>
                    <div className="status-card yellow">
                        <p>Pending</p>
                        <strong>{analyticsData.bookingStatusDistribution.find(i => i._id === 'pending')?.count || 0}</strong>
                    </div>
                </div>

                <section className="analytics-section">
                    <h2>📅 Bookings by Month</h2>
                    <div className="chart-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Bookings</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.bookingsByMonth.length > 0 ? (
                                    analyticsData.bookingsByMonth.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.month}</td>
                                            <td>
                                                <div className="bar-chart">
                                                    <div
                                                        className="bar"
                                                        style={{
                                                            width: `${(item.bookings / Math.max(...analyticsData.bookingsByMonth.map(x => x.bookings)) * 100) || 0}%`
                                                        }}
                                                    >
                                                        {item.bookings}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>₹{item.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="analytics-section">
                    <h2>💰 Revenue by Car Category</h2>
                    <div className="chart-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Total Revenue</th>
                                    <th>Bookings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.revenueByCategory.length > 0 ? (
                                    analyticsData.revenueByCategory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item._id}</td>
                                            <td>
                                                <strong>₹{item.totalRevenue.toLocaleString()}</strong>
                                            </td>
                                            <td>{item.bookings}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="analytics-section">
                    <h2>🚗 Car Category Distribution</h2>
                    <div className="chart-container">
                        <div className="pie-chart">
                            {analyticsData.carCategoryDistribution.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Count</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const total = analyticsData.carCategoryDistribution.reduce((sum, item) => sum + item.count, 0);
                                            return analyticsData.carCategoryDistribution.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item._id}</td>
                                                    <td>
                                                        <div className="bar-chart">
                                                            <div
                                                                className="bar"
                                                                style={{
                                                                    width: `${(item.count / total * 100)}%`,
                                                                    backgroundColor: `hsl(${idx * 60}, 70%, 50%)`
                                                                }}
                                                            >
                                                                {item.count}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{((item.count / total) * 100).toFixed(2)}%</td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No data available</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="analytics-section">
                    <h2>📊 Booking Status Distribution</h2>
                    <div className="chart-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Count</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.bookingStatusDistribution.length > 0 ? (
                                    (() => {
                                        const total = analyticsData.bookingStatusDistribution.reduce((sum, item) => sum + item.count, 0);
                                        const statusColors = {
                                            pending: '#f59e0b',
                                            confirmed: '#22c55e',
                                            cancelled: '#ef4444'
                                        };
                                        return analyticsData.bookingStatusDistribution.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <span className="status-indicator" style={{ backgroundColor: statusColors[item._id] }}></span>
                                                    {item._id}
                                                </td>
                                                <td>{item.count}</td>
                                                <td>
                                                    <div className="percentage-bar">
                                                        <div
                                                            className="percentage-fill"
                                                            style={{
                                                                width: `${(item.count / total * 100)}%`,
                                                                backgroundColor: statusColors[item._id]
                                                            }}
                                                        >
                                                            {((item.count / total) * 100).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ));
                                    })()
                                ) : (
                                    <tr><td colSpan="3">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
