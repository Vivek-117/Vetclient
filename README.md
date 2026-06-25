# Veterinary Clinic Management Dashboard

A React + Vite frontend for a veterinary clinic management application. The app is designed to support clinic staff with owner and pet records, appointment scheduling, medical records, billing, veterinarian management, and medicine inventory.

## Features

- Role-aware login and access control
- Dashboard overview with key clinic metrics
- Owner and pet management screens
- Appointment creation, status updates, and rescheduling
- Medical records for treatments and vaccinations
- Billing and invoice management
- Veterinarian profiles and appointment assignments
- Medicine stock monitoring and inventory updates

## Tech Stack

- React 19
- Vite
- JavaScript (JSX)
- Fetch-based REST API integration

## Project Structure

- `src/App.jsx` — main app routing and page rendering
- `src/context/AuthContext.jsx` — authentication state and login flow
- `src/services/api.js` — backend API client
- `src/components/` — reusable UI components
- `src/pages/` — application pages for dashboard, owners, pets, appointments, medical, billing, veterinarians, and medicine stock

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npm run dev
   ```

3. Open the app

   ```text
   http://localhost:5173
   ```

## Backend Requirements

This frontend expects a backend API at `http://localhost:5000/api`. The backend should support endpoints for authentication, dashboard stats, owners, pets, appointments, treatments, vaccinations, billing, veterinarians, and medicines.

## Notes

- The current project focuses on frontend functionality and consumes data from a REST API.
- Update `src/services/api.js` to match your backend routes and payload structure.

