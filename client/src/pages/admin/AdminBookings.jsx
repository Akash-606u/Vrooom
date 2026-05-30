import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/admin-bookings.css';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchAllBookings();
    }, [filterStatus]);

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const statusParam = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
            const response = await axios.get(
                `http://localhost:3000/api/admin/bookings${statusParam}`,
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:3000/api/admin/bookings/status',
                { bookingId, status: newStatus },
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                const updatedBookings = bookings.map(booking => 
                    booking._id === bookingId 
                        ? { ...booking, status: newStatus }
                        : booking
                );
                setBookings(updatedBookings);
                alert('Booking status updated!');
            }
        } catch (err) {
            console.log(err);
            alert('Failed to update booking status');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="bookings-container">
                <h1 className="page-title">All Bookings Management</h1>

                <div className="filters-section">
                    <label>Filter by Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {bookings.length === 0 ? (
                    <div className="no-data">
                        <p>No bookings found</p>
                    </div>
                ) : (
                    <div className="bookings-table-container">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Car</th>
                                    <th>User</th>
                                    <th>Owner</th>
                                    <th>Pickup Date</th>
                                    <th>Return Date</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td>
                                            <strong>{booking.car?.brand} {booking.car?.model}</strong>
                                            <small>{booking.car?.category}</small>
                                        </td>
                                        <td>
                                            <strong>{booking.user?.name}</strong>
                                            <small>{booking.user?.email}</small>
                                        </td>
                                        <td>
                                            <strong>{booking.owner?.name}</strong>
                                            <small>{booking.owner?.email}</small>
                                        </td>
                                        <td>{formatDate(booking.pickupDate)}</td>
                                        <td>{formatDate(booking.returnDate)}</td>
                                        <td className="price">₹{booking.price}</td>
                                        <td>
                                            <span className={`status-badge ${booking.status}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select 
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="summary-section">
                    <h3>Summary</h3>
                    <p>Total Bookings: {bookings.length}</p>
                    <p>Total Revenue: ₹{bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? b.price : 0), 0)}</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBookings;
