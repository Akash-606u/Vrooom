import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/admin-cars-list.css';

const AdminAllCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [deletingCarId, setDeletingCarId] = useState(null);

    useEffect(() => {
        fetchAllCars();
    }, [filterStatus]);

    const fetchAllCars = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const statusParam = filterStatus === 'all' ? '' : `&status=${filterStatus}`;
            const response = await axios.get(
                `http://localhost:3000/api/admin/cars/all?${statusParam}`,
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setCars(response.data.cars);
            }
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCar = async (carId) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                setDeletingCarId(carId);
                const token = localStorage.getItem('token');
                const response = await axios.delete(
                    'http://localhost:3000/api/admin/cars/delete',
                    {
                        data: { carId },
                        headers: { Authorization: token }
                    }
                );
                if (response.data.success) {
                    setCars(cars.filter(car => car._id !== carId));
                    alert('Car deleted successfully!');
                }
            } catch (err) {
                console.log(err);
                alert('Failed to delete car');
            } finally {
                setDeletingCarId(null);
            }
        }
    };

    const handleViewCar = (car) => {
        setSelectedCar(car);
    };

    const handleClosePreview = () => {
        setSelectedCar(null);
    };

    const approvedCount = cars.filter(car => car.approvalStatus === 'approved').length;
    const pendingCount = cars.filter(car => car.approvalStatus === 'pending').length;
    const rejectedCount = cars.filter(car => car.approvalStatus === 'rejected').length;
    const filteredCars = cars.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="all-cars-container">
                <div className="page-hero">
                    <div>
                        <p className="hero-label">Car Management</p>
                        <h1 className="page-title">All Cars Management</h1>
                        <p className="hero-description">Browse the full inventory, manage pending approvals, and review owner details from one polished dashboard.</p>
                    </div>
                </div>

                <div className="status-grid">
                    <div className="status-card approved">
                        <p>Total Cars</p>
                        <strong>{cars.length}</strong>
                    </div>
                    <div className="status-card blue">
                        <p>Approved</p>
                        <strong>{approvedCount}</strong>
                    </div>
                    <div className="status-card yellow">
                        <p>Pending</p>
                        <strong>{pendingCount}</strong>
                    </div>
                    <div className="status-card red">
                        <p>Rejected</p>
                        <strong>{rejectedCount}</strong>
                    </div>
                </div>

                <div className="filters-section">
                    <div className="filter-group">
                        <label>Filter by Status</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Search by brand, model, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredCars.length === 0 ? (
                    <div className="no-data">
                        <p>No cars found</p>
                    </div>
                ) : (
                    <div className="cars-table-container">
                        <table className="cars-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Brand & Model</th>
                                    <th>Year</th>
                                    <th>Category</th>
                                    <th>Owner</th>
                                    <th>Price/Day</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCars.map(car => (
                                    <tr key={car._id}>
                                        <td>
                                            <img src={car.image} alt={car.brand} className="car-img-thumb" />
                                        </td>
                                        <td>
                                            <strong>{car.brand} {car.model}</strong>
                                            <p className="table-subtext">{car.description || car.category}</p>
                                        </td>
                                        <td>{car.year}</td>
                                        <td>{car.category}</td>
                                        <td>
                                            <div>
                                                <p>{car.owner?.name}</p>
                                                <small>{car.owner?.email}</small>
                                            </div>
                                        </td>
                                        <td>₹{car.pricePerDay}</td>
                                        <td>
                                            <span className={`status-badge ${car.approvalStatus}`}>
                                                {car.approvalStatus}
                                            </span>
                                            {car.rejectionReason && (
                                                <small className="rejection-reason">
                                                    Reason: {car.rejectionReason}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-view"
                                                title="View Details"
                                                onClick={() => handleViewCar(car)}
                                            >
                                                👁️ View
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteCar(car._id)}
                                                disabled={deletingCarId === car._id}
                                                title="Delete Car"
                                            >
                                                {deletingCarId === car._id ? '⏳ Deleting...' : '🗑️ Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedCar && (
                    <div className="car-preview-overlay" onClick={handleClosePreview}>
                        <div className="car-preview-card" onClick={(e) => e.stopPropagation()}>
                            <button className="card-close-btn" onClick={handleClosePreview}>
                                ✕
                            </button>
                            <div className="preview-grid">
                                <img
                                    src={selectedCar.image || 'https://via.placeholder.com/720x480'}
                                    alt={`${selectedCar.brand} ${selectedCar.model}`}
                                    className="preview-image"
                                />
                                <div className="preview-details">
                                    <p className="hero-label">Car Details</p>
                                    <h2>{selectedCar.brand} {selectedCar.model}</h2>
                                    <p className="preview-description">
                                        {selectedCar.description || 'No description available for this car.'}
                                    </p>
                                    <div className="preview-row">
                                        <span className="preview-label">Year</span>
                                        <span className="preview-value">{selectedCar.year || 'N/A'}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Category</span>
                                        <span className="preview-value">{selectedCar.category || 'N/A'}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Price / Day</span>
                                        <span className="preview-value">₹{selectedCar.pricePerDay || 'N/A'}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Owner</span>
                                        <span className="preview-value">{selectedCar.owner?.name || 'Unknown'}{selectedCar.owner?.email ? ` — ${selectedCar.owner.email}` : ''}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Status</span>
                                        <span className="preview-value">{selectedCar.approvalStatus || 'N/A'}</span>
                                    </div>
                                    {selectedCar.rejectionReason && (
                                        <div className="preview-row">
                                            <span className="preview-label">Rejection Reason</span>
                                            <span className="preview-value">{selectedCar.rejectionReason}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAllCars;
