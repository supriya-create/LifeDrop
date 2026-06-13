# LifeDrop Backend

## Overview

This is the backend for the LifeDrop blood bank application. It provides APIs for authentication, hospital management, blood inventory, donation requests, enquiries, newsletter subscriptions, and notifications.

## What was added

- Role-based user management with `admin`, `staff`, `hospital`, and `donor` roles
- Protected `/api/users/me` profile endpoints
- Search and filter support for hospitals and requests
- Low-stock inventory alert endpoint at `/api/inventory/alerts`
- Admin campaign email support for subscribers
- Secure file upload filtering for enquiry attachments
- Production-related middleware: Helmet, request logging, and rate limiting
- Environment example for production deployment

## Setup

1. Copy `.env.example` to `.env` and set your values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Important environment variables

- `PORT` - port for the server
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `ADMIN_EMAIL` - email to receive admin notifications
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - SMTP settings for outgoing mail

## Useful endpoints

- `POST /api/auth/register` - create a new donor account
- `POST /api/auth/login` - authenticate and get a JWT
- `GET /api/users/me` - get current profile
- `PUT /api/users/me` - update current profile
- `GET /api/hospitals?search=...&status=...` - search hospitals
- `GET /api/requests?status=...&hospital=...&bloodGroup=...` - list filtered requests
- `GET /api/inventory/alerts` - critical inventory items
- `POST /api/newsletter/campaign` - admin sends campaign emails to subscribers
- `POST /api/requests/:id/dispatch` - mark a blood request as dispatched
- Hospital update emails are sent when approval status changes
- Admin receives notifications for new hospitals and blood requests

## Next steps for launch

- Add API tests and request validation
- Move admin-only routes to a dedicated admin dashboard
- Use a process manager like `pm2` or Docker for deployment
- Configure MongoDB Atlas or another managed database
- Enable HTTPS and secure CORS for production
