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
            }
        }
    };

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
                <h1 className="page-title">All Cars Management</h1>

                <div className="filters-section">
                    <div className="filter-group">
                        <label>Filter by Status:</label>
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
                                            >
                                                👁️ View
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDeleteCar(car._id)}
                                                title="Delete Car"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAllCars;
