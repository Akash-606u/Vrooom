import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Admin';
    const userRole = localStorage.getItem('userRole') || 'Administrator';

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="brand-block">
                        <div className="brand-mark">V</div>
                        <div>
                            <p className="brand-label">Vrooom</p>
                            <p className="brand-subtitle">Admin</p>
                        </div>
                    </div>
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
                </div>

                <div className="sidebar-profile">
                    <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
                    <div className="profile-info">
                        <span className="profile-role">{userRole}</span>
                        <h3>{userName}</h3>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/admin/dashboard"
                        className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    >
                        📊 Dashboard
                    </Link>

                    <div className="nav-section">
                        <h3>Car Management</h3>
                        <Link
                            to="/admin/car-approval"
                            className={`nav-item ${isActive('/admin/car-approval') ? 'active' : ''}`}
                        >
                            ✅ Car Approvals
                        </Link>
                        <Link
                            to="/admin/all-cars"
                            className={`nav-item ${isActive('/admin/all-cars') ? 'active' : ''}`}
                        >
                            🚗 All Cars
                        </Link>
                    </div>

                    <div className="nav-section">
                        <h3>Booking Management</h3>
                        <Link
                            to="/admin/bookings"
                            className={`nav-item ${isActive('/admin/bookings') ? 'active' : ''}`}
                        >
                            📅 All Bookings
                        </Link>
                    </div>

                    <div className="nav-section">
                        <h3>Analytics</h3>
                        <Link
                            to="/admin/analytics"
                            className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`}
                        >
                            📈 Analytics
                        </Link>
                    </div>

                    <div className="nav-section">
                        <h3>User Management</h3>
                        <Link
                            to="/admin/users"
                            className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
                        >
                            👥 Users & Owners
                        </Link>
                    </div>
                </nav>

                <button className="logout-btn sidebar-logout" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </aside>

            {/* Main Content */}
            <div className="admin-content">
                <header className="admin-header">
                    <div>
                        <p className="admin-badge">Dashboard Overview</p>
                        <h1>Welcome back, Admin</h1>
                        <p className="admin-subtitle">Monitor platform performance, manage cars, bookings, revenue, and user activity from one place.</p>
                    </div>
                    <div className="admin-actions">
                        <div className="admin-user-card">
                            <span>👋</span>
                            <div>
                                <p>Hello,</p>
                                <strong>{userName}</strong>
                            </div>
                        </div>
                        <button className="logout-btn header-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="admin-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
