import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/admin-users.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchAllUsers();
    }, [filterRole]);

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const roleParam = filterRole === 'all' ? '' : `?role=${filterRole}`;
            const response = await axios.get(
                `http://localhost:3000/api/admin/users${roleParam}`,
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/api/admin/users/status',
                { userId },
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                const updatedUsers = users.map(user =>
                    user._id === userId
                        ? { ...user, isActive: !user.isActive }
                        : user
                );
                setUsers(updatedUsers);
                alert('User status updated!');
            }
        } catch (err) {
            console.log(err);
            alert('Failed to update user status');
        }
    };

    const handleGetUserDetails = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/api/admin/users/details',
                { userId },
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setSelectedUser(response.data);
            }
        } catch (err) {
            console.log(err);
            alert('Failed to fetch user details');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalOwners = users.filter(user => user.role === 'owner').length;
    const totalRegular = users.filter(user => user.role === 'user').length;
    const activeUsers = users.filter(user => user.isActive).length;

    if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="users-container">
                <div className="page-hero">
                    <div>
                        <p className="hero-label">User Management</p>
                        <h1 className="page-title">User & Owner Management</h1>
                        <p className="hero-description">Search, filter, and manage users and owners with a clean, dashboard-driven interface.</p>
                    </div>
                </div>

                <div className="status-grid users-status-grid">
                    <div className="status-card blue">
                        <p>Total Users</p>
                        <strong>{users.length}</strong>
                    </div>
                    <div className="status-card violet">
                        <p>Owners</p>
                        <strong>{totalOwners}</strong>
                    </div>
                    <div className="status-card green">
                        <p>Regular Users</p>
                        <strong>{totalRegular}</strong>
                    </div>
                    <div className="status-card yellow">
                        <p>Active</p>
                        <strong>{activeUsers}</strong>
                    </div>
                </div>

                <div className="filters-section">
                    <div className="filter-group">
                        <label>Filter by Role</label>
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="all">All Users</option>
                            <option value="user">Regular Users</option>
                            <option value="owner">Car Owners</option>
                        </select>
                    </div>

                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="users-content">
                    <div className="users-list">
                        <h2>Users ({filteredUsers.length})</h2>
                        {filteredUsers.length === 0 ? (
                            <div className="no-data">
                                <p>No users found</p>
                            </div>
                        ) : (
                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Profile</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user._id}>
                                                <td>
                                                    <img src={user.image || 'https://via.placeholder.com/40'} alt={user.name} className="user-avatar" />
                                                </td>
                                                <td><strong>{user.name}</strong></td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-badge ${user.role}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-view-details"
                                                        onClick={() => handleGetUserDetails(user._id)}
                                                    >
                                                        👁️ View
                                                    </button>
                                                    <button
                                                        className={`btn-toggle-status ${user.isActive ? 'deactivate' : 'activate'}`}
                                                        onClick={() => handleToggleStatus(user._id)}
                                                    >
                                                        {user.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {selectedUser && (
                        <div className="user-details">
                            <h2>User Details</h2>
                            <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>

                            <div className="details-content">
                                <img src={selectedUser.user.image || 'https://via.placeholder.com/100'} alt={selectedUser.user.name} className="detail-avatar" />

                                <div className="user-info">
                                    <div className="info-row">
                                        <label>Name:</label>
                                        <p>{selectedUser.user.name}</p>
                                    </div>
                                    <div className="info-row">
                                        <label>Email:</label>
                                        <p>{selectedUser.user.email}</p>
                                    </div>
                                    <div className="info-row">
                                        <label>Role:</label>
                                        <p>{selectedUser.user.role}</p>
                                    </div>
                                    <div className="info-row">
                                        <label>Status:</label>
                                        <p>{selectedUser.user.isActive ? 'Active' : 'Inactive'}</p>
                                    </div>
                                    <div className="info-row">
                                        <label>Joined:</label>
                                        <p>{new Date(selectedUser.user.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                {selectedUser.cars.length > 0 && (
                                    <div className="cars-section">
                                        <h3>Cars ({selectedUser.cars.length})</h3>
                                        <div className="cars-list">
                                            {selectedUser.cars.map(car => (
                                                <div key={car._id} className="car-item">
                                                    <p>{car.brand} {car.model} ({car.year})</p>
                                                    <p className="car-status">{car.approvalStatus}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedUser.bookings.length > 0 && (
                                    <div className="bookings-section">
                                        <h3>Recent Bookings ({selectedUser.bookings.length})</h3>
                                        <div className="bookings-list">
                                            {selectedUser.bookings.map(booking => (
                                                <div key={booking._id} className="booking-item">
                                                    <p>{booking.car?.brand} {booking.car?.model}</p>
                                                    <p className="booking-status">{booking.status}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
