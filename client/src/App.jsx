import React, { useState } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/CarDetails'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import PaymentSuccess from './pages/PaymentSuccess'
import Footer from './components/Footer'
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import AddCar from './pages/owner/AddCar'
import ManageCars from './pages/owner/ManageCars'
import ManageBookings from './pages/owner/ManageBookings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCarApproval from './pages/admin/AdminCarApproval'
import AdminAllCars from './pages/admin/AdminAllCars'
import AdminBookings from './pages/admin/AdminBookings'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const App = () => {

  const {showLogin} = useAppContext()
  const location = useLocation()
  const isOwnerPath = location.pathname.startsWith('/owner')
  const isAdminPath = location.pathname.startsWith('/admin')

  return (
    <>
     <Toaster />
      {showLogin && <Login/>}

      {!isOwnerPath && !isAdminPath && <Navbar/>}

    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/car-details/:id' element={<CarDetails/>}/>
      <Route path='/cars' element={<Cars/>}/>
      <Route path='/my-bookings' element={<MyBookings/>}/>
      <Route path='/payment-success' element={<PaymentSuccess/>}/>
      <Route path='/owner' element={<Layout />}>
        <Route index element={<Dashboard />}/>
        <Route path="add-car" element={<AddCar />}/>
        <Route path="manage-cars" element={<ManageCars />}/>
        <Route path="manage-bookings" element={<ManageBookings />}/>
      </Route>
      <Route path='/admin/dashboard' element={<AdminDashboard />}/>
      <Route path='/admin/car-approval' element={<AdminCarApproval />}/>
      <Route path='/admin/all-cars' element={<AdminAllCars />}/>
      <Route path='/admin/bookings' element={<AdminBookings />}/>
      <Route path='/admin/analytics' element={<AdminAnalytics />}/>
      <Route path='/admin/users' element={<AdminUsers />}/>
    </Routes>

    {!isOwnerPath && !isAdminPath && <Footer />}
    
    </>
  )
}

export default App
