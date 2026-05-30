# Vrooom Application Architecture

## Overview

Vrooom is a car rental marketplace with separate user and owner workflows. Users can search cars, book rentals, upload mandatory verification documents, and choose either online payment or pay at pickup. Owners can manage cars, view bookings, and upload pickup documents before handing over the car.

## Architecture

The application is split into two main folders:

- `client/` — React + Vite frontend
- `server/` — Node.js + Express backend with MongoDB via Mongoose

### Frontend

Key parts:
- `src/pages/CarDetails.jsx` — booking page, payment selection, document upload.
- `src/pages/MyBookings.jsx` — user booking history with payment and verification status.
- `src/pages/owner/ManageBookings.jsx` — owner booking dashboard with document review and upload.
- `src/context/AppContext.jsx` — shared Axios instance, auth state, dates, and site data.

Frontend flow:
1. User selects a car and enters pickup/return dates.
2. User chooses a payment option:
   - `Pay at pickup` (cash)
   - `Pay now online` with Stripe or Razorpay
3. User uploads mandatory documents:
   - Driving license
   - Identity proof (Aadhaar / PAN)
4. Booking is submitted to backend as `multipart/form-data`.
5. If online payment is selected, the user is routed into Stripe or Razorpay checkout.
6. After payment, the booking status is confirmed.
7. The user can view booking status and verification details in `MyBookings`.

### Backend

Key parts:
- `server/server.js` — primary Express app entry point and middleware setup.
- `server/routes/bookingRoutes.js` — booking-related API endpoints.
- `server/controllers/bookingController.js` — booking creation, payment confirmation, owner document upload, and booking retrieval.
- `server/models/Booking.js` — booking schema including payment and document fields.
- `server/configs/imageKit.js` — ImageKit setup for file upload.
- `server/middleware/multer.js` — file upload middleware.

Backend flow:
1. `POST /api/bookings/create`
   - Validates car availability and user auth.
   - Requires both user document files.
   - Uploads documents to ImageKit.
   - Creates a booking record with `userDocuments`.
   - Handles payment option:
     - `pay_at_pickup` → booking stored pending payment.
     - `stripe` → creates Stripe checkout session, stores session info.
     - `razorpay` → creates Razorpay order, stores order info.
2. `POST /api/bookings/confirm-payment`
   - Validates authenticated user and booking ownership.
   - Confirms Stripe or Razorpay payment.
   - Updates booking status to `confirmed` and payment status to `paid`.
3. `POST /api/bookings/owner-upload-docs`
   - Allows owners to upload or replace pickup verification documents.
   - Uploads files to ImageKit and stores in `ownerDocuments`.
4. `GET /api/bookings/user` and `GET /api/bookings/owner`
   - Return booking lists with related car and user data.

## Booking and Payment Flow

### Booking creation

`Booking` records contain:
- `car`, `user`, `owner`
- `pickupDate`, `returnDate`
- `price`
- `paymentOption` (`pay_at_pickup` or `pay_now`)
- `paymentGateway` (`cash`, `stripe`, `razorpay`)
- `paymentStatus` (`pending`, `paid`, `failed`)
- `paymentInfo`
- `userDocuments`
- `ownerDocuments`

### Payment options

- `pay_at_pickup`
  - No payment is taken online.
  - `paymentGateway` is saved as `cash`.
  - Booking remains pending until pickup.
- `pay_now` with Stripe
  - Creates Stripe checkout session.
  - Redirects user to Stripe.
  - After payment, the frontend confirms payment via `/confirm-payment`.
- `pay_now` with Razorpay
  - Creates a Razorpay order.
  - Opens Razorpay checkout in the client.
  - After payment, the frontend confirms payment via `/confirm-payment`.

## Document Verification Flow

### User documents

- Uploaded during booking creation.
- Must include:
  - Driving license
  - Identity proof
- Stored as URLs in `booking.userDocuments`.
- Used to validate every booking before car handover.

### Owner pickup documents

- Owners can upload or replace their own pickup documents in `ManageBookings`.
- Stored as URLs in `booking.ownerDocuments`.
- This flow ensures the owner also submits verification documents before releasing the car.

## Key Files and Responsibilities

- `client/src/pages/CarDetails.jsx` — booking and document upload UI
- `client/src/pages/MyBookings.jsx` — user booking details and document status
- `client/src/pages/owner/ManageBookings.jsx` — owner review and pickup document handling
- `server/routes/bookingRoutes.js` — booking API endpoints
- `server/controllers/bookingController.js` — booking, payment, and document upload logic
- `server/models/Booking.js` — booking storage design
- `server/configs/imageKit.js` — file upload integration
- `server/middleware/multer.js` — file handling for document upload

## Environment

The server expects environment variables such as:
- `MONGO_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CLIENT_URL`
- ImageKit credentials

## Summary

This application is designed around a user-driven booking process with mandatory document upload, coupled with flexible payment support and an owner pickup verification layer. The split frontend/backend architecture keeps UI concerns separate from booking, payment, and upload logic.
