# Store Rating Management System

A production-ready, full-stack Store Rating Management System built with **Node.js**, **Express.js**, **Prisma ORM**, **PostgreSQL**, **React**, **Vite**, and **Tailwind CSS**.

The system features unified authentication, role-based authorization (RBAC), database constraints, strict input validation, and responsive role-tailored dashboards.

---

## Features & Roles

### 1. Common Authentication & Security
- **Unified Login**: One common login page (`/login`) for all 3 roles (**ADMIN**, **STORE_OWNER**, **NORMAL_USER**).
- **Public Customer Signup**: New customers can register at `/register`.
- **JWT & Password Security**: Passwords hashed with `bcryptjs` (10 rounds). Standardized JWT Bearer token authentication with 401/403 handling.
- **Account Password Management**: Logged-in users can update their passwords securely from the navigation bar.

### 2. Admin Portal (`/admin/dashboard`)
- **Top Metrics Cards**: Total Users, Total Stores, and Total Ratings.
- **User Management**: Search by name/email/address, filter by role (ADMIN, STORE_OWNER, NORMAL_USER), sort, paginate, and create new users with custom roles.
- **Store Management**: Search, sort by name or overall rating, view average rating, create new stores, and assign unassigned Store Owners.

### 3. Store Owner Portal (`/owner/dashboard`)
- **Assigned Store Metrics**: Store name, email, physical address, registration date, average rating, and total rating count.
- **Rating Distribution**: Visual breakdown of ratings across 1 to 5 stars with percentage progress indicators.
- **Customer Review History**: Table displaying customer details (name, email), rating values, and review dates.
- **Strict Data Isolation**: Store owners can only view analytics for their assigned store.

### 4. Customer Store Discovery Portal (`/stores`)
- **Store Directory**: Interactive store cards with calculated `overallRating` and rating counts.
- **Search & Filters**: Real-time search by store name or address, and sorting (Name A-Z, Highest Rated, Lowest Rated).
- **Interactive 5-Star Rating**: Clickable 5-star rating control allowing users to submit or update their rating for any store with single-rating database constraint enforcement.

---

## Technology Stack

- **Backend**: Node.js (v18+), Express.js, Prisma ORM, PostgreSQL, JWT (`jsonwebtoken`), `bcryptjs`, Zod, `cors`, `dotenv`.
- **Frontend**: React (v18), Vite, React Router DOM (v6), Axios, Tailwind CSS, Lucide React icons.

---

## Database Models & Rules

### `User`
- `id`: UUID Primary Key
- `name`: String (20–60 characters)
- `email`: String (Unique)
- `password`: String (Stored as bcrypt hash)
- `address`: String (Max 400 characters)
- `role`: Enum (`ADMIN`, `NORMAL_USER`, `STORE_OWNER`)
- `createdAt`: DateTime

### `Store`
- `id`: UUID Primary Key
- `name`: String (Max 60 characters)
- `email`: String (Unique)
- `address`: String (Max 400 characters)
- `ownerId`: UUID (Unique Foreign Key to `User`)
- `createdAt`: DateTime

### `Rating`
- `id`: UUID Primary Key
- `value`: Integer (1 to 5)
- `userId`: UUID (Foreign Key to `User`)
- `storeId`: UUID (Foreign Key to `Store`)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Constraint**: `@@unique([userId, storeId])` prevents duplicate ratings per user/store pair.

---

## Validation Requirements

- **Name**: 20 to 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8 to 16 characters, containing at least 1 uppercase letter (`[A-Z]`) and 1 special symbol (`[!@#$%^&*]`).
- **Email**: Valid email format.
- **Rating**: Integer between 1 and 5.

---

## Demo Accounts & Credentials

The seed script creates the following demo credentials for evaluation:

| Role | Email | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@storerating.com` | `Admin@123` | `System Administrator Account` |
| **STORE_OWNER** | `owner1@storerating.com` | `Owner@123` | `Store Owner Manager One` |
| **STORE_OWNER** | `owner2@storerating.com` | `Owner@123` | `Store Owner Manager Two` |
| **NORMAL_USER** | `user1@storerating.com` | `User@123` | `Normal Customer User One` |
| **NORMAL_USER** | `user2@storerating.com` | `User@123` | `Normal Customer User Two` |

*Note: The login page includes instant demo buttons to autofill credentials for testing.*

---

## Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local or remote PostgreSQL instance running on port `5432`

---

### 1. Database & Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (`backend/.env`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:Postgres%40123@localhost:5432/storerating_db?schema=public"
   JWT_SECRET="super_secret_store_rating_jwt_key_2026_xyz"
   CLIENT_URL="http://localhost:5173"
   ```
   *(Replace password and port as per your local PostgreSQL setup)*

4. Run Prisma database migrations / push schema:
   ```bash
   npx prisma db push
   ```

5. Seed database with demo data:
   ```bash
   npm run seed
   ```

6. Start backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. In a new terminal, navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   The web application will open on `http://localhost:5173`.

---

## API Summary

### Authentication APIs
- `POST /api/auth/signup` — Public customer account creation
- `POST /api/auth/login` — Unified login for all roles
- `PATCH /api/auth/update-password` — Password update (Authenticated)
- `GET /api/auth/me` — Current user profile

### Admin APIs (`ADMIN` role required)
- `GET /api/admin/dashboard-stats` — Platform metrics (Total Users, Stores, Ratings)
- `POST /api/admin/users` — Admin user creation (Any role)
- `GET /api/admin/users` — User directory (Search, filter by role, sort, paginate)
- `POST /api/admin/stores` — Create store & assign Store Owner
- `GET /api/admin/stores` — Store directory with ratings and owner info
- `GET /api/admin/available-owners` — Unassigned Store Owners dropdown

### Customer APIs (`NORMAL_USER` role required for rating)
- `GET /api/stores` — Store discovery directory with search and calculated overall rating
- `POST /api/stores/:storeId/rate` — Rating upsert (1-5 stars)

### Store Owner API (`STORE_OWNER` role required)
- `GET /api/owner/dashboard` — Analytics for authenticated owner's assigned store

---

## Verification & Testing

- **Backend Health Check**: `GET http://localhost:5000/api/health`
- **Role Redirection**: Attempting to visit `/admin/dashboard` as a customer automatically redirects to `/stores`.
- **Database Safeguards**: Attempting duplicate rating creation triggers `upsert` logic, maintaining single-rating integrity per store.
