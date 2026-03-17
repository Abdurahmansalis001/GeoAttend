
# Root README.md
root_readme = '''# GeoAttend - Location-Based Attendance System

A full-stack attendance management system for universities with geolocation verification.

## System Overview

GeoAttend ensures students can only mark attendance when physically present within a defined geofence area (classroom).

### User Roles

- **Student**: View courses, check in to active sessions using GPS location
- **Lecturer**: Create courses, start/stop attendance sessions, view live attendance
- **Admin**: System overview, user management, view all reports

## Tech Stack

### Backend
- Node.js + Express
- JWT Authentication
- bcryptjs (password hashing)
- CORS enabled
- In-memory storage (structured for easy DB upgrade)

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- React Router v6
- Axios (HTTP client)
- date-fns (date formatting)
- lucide-react (icons)

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Start server
npm run dev
```

Server runs on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

## API Endpoints

### Auth
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/profile` - Get user profile

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (lecturer/admin)

### Attendance
- `POST /api/attendance/session/start` - Start attendance session
- `POST /api/attendance/session/stop` - Stop attendance session
- `GET /api/attendance/session/active` - Get active sessions
- `POST /api/attendance/checkin` - Student check-in
- `GET /api/attendance/my-attendance` - Get my attendance records

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system stats

## Geolocation Logic

The system uses the Haversine formula to calculate distance between student location and session location:

```javascript
// Distance calculation (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  // ... calculation
  return distanceInMeters;
}
```

Attendance is only recorded if the student is within the specified radius (default: 50m).

## Security Features

- Passwords hashed with bcryptjs
- JWT tokens with 1-day expiration
- Protected routes with role-based access control
- CORS enabled for API security

## Project Structure

```
geoattend/
├── backend/
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API routes
│   ├── utils/          # Haversine formula
│   ├── server.js       # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # UI components
    │   ├── context/     # Auth context
    │   ├── hooks/        # Custom hooks
    │   ├── pages/        # Page components
    │   ├── routes/       # Route protection
    │   ├── services/     # API calls
    │   └── types/        # TypeScript types
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## Demo Credentials

You can register new accounts or use these test flows:

1. Register as a Lecturer → Create courses → Start attendance sessions
2. Register as a Student → View available sessions → Check in (requires GPS location)
3. Register as an Admin → View system statistics and all users

## Browser Requirements

- Modern browsers with geolocation support
- HTTPS required for geolocation in production (or localhost for development)
- Location permissions must be granted

## License

MIT
'''

with open("/mnt/kimi/output/geoattend/README.md", "w") as f:
    f.write(root_readme)

print("Created root README.md")
