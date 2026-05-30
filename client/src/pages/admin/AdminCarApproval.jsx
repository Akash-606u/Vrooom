import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/Admin/AdminLayout';
import '../../styles/admin-car-approval.css';

const AdminCarApproval = () => {
    const [pendingCars, setPendingCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingCars();
    }, []);

    const fetchPendingCars = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/cars/pending', {
                headers: { Authorization: token }
            });
            if (response.data.success) {
                setPendingCars(response.data.cars);
            }
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCar = async (carId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:3000/api/admin/cars/approve',
                { carId },
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setPendingCars(pendingCars.filter(car => car._id !== carId));
                alert('Car approved successfully!');
                setSelectedCar(null);
            }
        } catch (err) {
            console.log(err);
            alert('Failed to approve car');
        }
    };

    const handleRejectCar = async (carId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:3000/api/admin/cars/reject',
                { carId, reason: rejectionReason },
                { headers: { Authorization: token } }
            );
            if (response.data.success) {
                setPendingCars(pendingCars.filter(car => car._id !== carId));
                alert('Car rejected!');
                setSelectedCar(null);
                setRejectionReason('');
            }
        } catch (err) {
            console.log(err);
            alert('Failed to reject car');
        }
    };

    if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="car-approval-container">
                <h1 className="page-title">Car Approval Management</h1>

                {pendingCars.length === 0 ? (
                    <div className="no-data">
                        <p>✅ All cars have been reviewed! No pending approvals.</p>
                    </div>
                ) : (
                    <div className="approval-content">
                        <div className="cars-list">
                            <h2>Pending Cars ({pendingCars.length})</h2>
                            {pendingCars.map(car => (
                                <div 
                                    key={car._id}
                                    className={`car-card ${selectedCar?._id === car._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedCar(car)}
                                >
                                    <img src={car.image} alt={car.brand} className="car-thumbnail" />
                                    <div className="car-info">
                                        <h3>{car.brand} {car.model}</h3>
                                        <p>Year: {car.year}</p>
                                        <p>Owner: {car.owner?.name}</p>
                                        <p>Category: {car.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedCar && (
                            <div className="car-details">
                                <h2>Car Details</h2>
                                <div className="details-content">
                                    <img src={selectedCar.image} alt={selectedCar.brand} className="detail-image" />
                                    
                                    <div className="details-info">
                                        <div className="info-row">
                                            <label>Brand</label>
                                            <p>{selectedCar.brand}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Model</label>
                                            <p>{selectedCar.model}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Year</label>
                                            <p>{selectedCar.year}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Category</label>
                                            <p>{selectedCar.category}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Seating Capacity</label>
                                            <p>{selectedCar.seating_capacity}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Fuel Type</label>
                                            <p>{selectedCar.fuel_type}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Transmission</label>
                                            <p>{selectedCar.transmission}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Price Per Day</label>
                                            <p>₹{selectedCar.pricePerDay}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Location</label>
                                            <p>{selectedCar.location}</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Owner</label>
                                            <p>{selectedCar.owner?.name} ({selectedCar.owner?.email})</p>
                                        </div>
                                        <div className="info-row">
                                            <label>Description</label>
                                            <p>{selectedCar.description}</p>
                                        </div>
                                    </div>

                                    <div className="approval-actions">
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-approve"
                                                onClick={() => handleApproveCar(selectedCar._id)}
                                            >
                                                ✅ Approve Car
                                            </button>
                                            <button 
                                                className="btn-reject"
                                                onClick={() => document.querySelector('.rejection-form').style.display = 'block'}
                                            >
                                                ❌ Reject Car
                                            </button>
                                        </div>

                                        <div className="rejection-form" style={{display: 'none'}}>
                                            <h3>Rejection Reason</h3>
                                            <textarea 
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Enter reason for rejection..."
                                                rows="4"
                                            ></textarea>
                                            <div className="form-buttons">
                                                <button 
                                                    className="btn-submit"
                                                    onClick={() => handleRejectCar(selectedCar._id)}
                                                >
                                                    Submit Rejection
                                                </button>
                                                <button 
                                                    className="btn-cancel"
                                                    onClick={() => {
                                                        document.querySelector('.rejection-form').style.display = 'none';
                                                        setRejectionReason('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCarApproval;
