
# GeoAttend Backend

Location-based attendance management system API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Start server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST /api/register - Register new user
- POST /api/login - Login user
- GET /api/profile - Get user profile

### Courses
- GET /api/courses - Get all courses
- POST /api/courses - Create course (lecturer/admin)
- GET /api/courses/:id - Get single course

### Attendance
- POST /api/attendance/session/start - Start attendance session
- POST /api/attendance/session/stop - Stop attendance session
- GET /api/attendance/session/active - Get active sessions
- POST /api/attendance/checkin - Student check-in
- GET /api/attendance/my-attendance - Get my attendance records
- GET /api/attendance/stats/course/:id - Get course attendance stats

### Admin
- GET /api/admin/users - Get all users
- GET /api/admin/stats - Get system stats
- GET /api/admin/attendance-records - Get all attendance records
