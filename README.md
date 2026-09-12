# Merzado – B2B RFQ Marketplace

A full-stack B2B Request for Quotation (RFQ) marketplace where buyers can create procurement requests and suppliers can browse RFQs and submit quotations.

## Live Demo

* Frontend: https://merzado-task.vercel.app/
* Backend API: https://merzado-task.onrender.com
* API Health Check: https://merzado-task.onrender.com/api/health
* GitHub: https://github.com/saisanthosharyan/merzado-task

## Features

### Buyer

* Secure signup and login
* Create RFQs
* Edit RFQs
* Delete RFQs
* View submitted RFQs
* Search and manage procurement requests
* View supplier quotations for RFQs

### Supplier

* Secure signup and login
* Browse available RFQs
* Search RFQs
* Filter RFQs by location and status
* View RFQ details
* Submit quotations
* View submitted quotations

### Authentication & Security

* JWT-based authentication
* Password hashing using bcrypt
* Role-based authorization
* Buyer and Supplier access controls
* Protected API routes
* Request validation using Zod
* Duplicate quotation prevention
* Ownership checks for RFQs
* Proper HTTP status codes and error responses

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript
* REST API
* JWT
* bcryptjs
* Zod

### Database

* MongoDB Atlas
* Mongoose

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

## Architecture

```text
merzado-task/
│
├── frontend/
│   └── src/
│       └── app/
│           ├── buyer/
│           ├── supplier/
│           ├── login/
│           ├── signup/
│           └── ...
│
└── backend/
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── utils/
```

The frontend communicates with the Express backend through REST APIs.

The backend handles authentication, authorization, validation, RFQ management, quotations, and database operations.

MongoDB Atlas provides persistent data storage.

## Main API Endpoints

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### RFQs

```text
POST   /api/rfqs
GET    /api/rfqs
GET    /api/rfqs/:id
PUT    /api/rfqs/:id
DELETE /api/rfqs/:id
```

### Quotations

```text
POST /api/quotations
GET  /api/quotations/my
GET  /api/rfqs/:id/quotations
```

### Health

```text
GET /api/health
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/saisanthosharyan/merzado-task.git
cd merzado-task
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Validation and Error Handling

The application validates user input on the backend and provides meaningful error responses.

Examples include:

* Invalid email
* Weak or missing password
* Invalid RFQ quantity
* Past RFQ deadline
* Missing required fields
* Invalid IDs
* Unauthorized requests
* Forbidden role-based actions
* Duplicate quotations
* Non-existent RFQs

The frontend also provides loading, empty, and error states where appropriate.

## User Roles

### Buyer

Buyers create procurement requirements and receive quotations from suppliers.

### Supplier

Suppliers discover relevant procurement requirements and submit competitive quotations.

## Assumptions

* An RFQ can receive quotations while it is open and before its deadline.
* A supplier can submit only one quotation per RFQ.
* Buyers can manage only their own RFQs.
* Suppliers cannot create or manage buyer RFQs.
* Buyers cannot submit supplier quotations.
* Authentication is required for protected operations.
* MongoDB Atlas is used as the persistent production database.

## Testing

The backend APIs were tested for:

* Authentication
* Authorization
* RFQ CRUD operations
* Role restrictions
* Quotation submission
* Duplicate quotation prevention
* Input validation
* Search and filtering
* Invalid and non-existent IDs
* Error handling

The frontend production build and TypeScript checks were also verified successfully.

## Deployment

The production application is deployed using:

* Vercel for the Next.js frontend
* Render for the Express backend
* MongoDB Atlas for the database

### Production URLs

Frontend:

https://merzado-task.vercel.app/

Backend:

https://merzado-task.onrender.com

## Future Improvements

* Supplier profiles and company verification
* Buyer and supplier dashboards with analytics
* Notifications for new quotations
* Email notifications
* RFQ status tracking
* Advanced supplier search and ranking
* File attachments for RFQs
* Real-time notifications
* Admin dashboard
* Production-level rate limiting and stricter CORS configuration

## Author

Santhosh Aryan

GitHub: https://github.com/saisanthosharyan

LinkedIn: https://www.linkedin.com/in/sri-sai-santhosh-aryan-k-316767280/
