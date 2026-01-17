# Store Rating Application

A full-stack web application that allows users to submit and manage ratings for stores with role-based access control.

## Features

### Role-Based Access Control
- **System Administrator**: Manage users and stores, view system-wide statistics and analytics.
- **Store Owner**: View ratings and average scores for their own stores.
- **Normal User**: Browse stores, search by name/address, and submit/edit ratings (1-5 stars).

### Core Functionalities
- Secure session-based authentication with passport.js.
- Real-time rating aggregation and average calculation.
- Dynamic dashboards tailored to each user role.
- Responsive UI built with React and Shadcn UI.

## Tech Stack
- **Frontend**: React, TanStack Query, Shadcn UI, Tailwind CSS.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Passport.js (Local Strategy).

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database

### Local Setup Instructions

1. **Clone the repository** (or download the source).

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_random_session_secret
   ```

4. **Initialize the Database**:
   Push the schema to your PostgreSQL instance:
   ```bash
   npm run db:push
   ```

5. **Run the Application**:
   Start the development server (runs both frontend and backend):
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000`.

## Deployment to Render

1. **Create a new Web Service** on Render.
2. **Connect your repository**.
3. **Environment Settings**:
   - Environment: `Node`
   - Build Command: `npm run build`
   - Start Command: `npm run start`
4. **Environment Variables**:
   Add `DATABASE_URL` and `SESSION_SECRET` in the Render dashboard.
5. **Database**: Use a Render PostgreSQL instance and copy the Internal/External Database URL to your environment variables.

## Default Test Accounts
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@system.com` | `AdminPassword1!` |
| **Store Owner** | `owner@store.com` | `OwnerPassword1!` |
| **Normal User** | `user@test.com` | `UserPassword1!` |
