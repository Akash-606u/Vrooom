import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Vrooom Admin</h2>
                    <button 
                        className="toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
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

                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                <header className="admin-header">
                    <h1>Admin Panel</h1>
                    <div className="header-actions">
                        <span className="admin-icon">👨‍💼</span>
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
