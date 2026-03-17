# GeoAttend Frontend

React + TypeScript + Vite + Tailwind CSS v4 frontend for the GeoAttend location-based attendance system.

## Features

- 🔐 JWT Authentication
- 📍 Geolocation-based attendance check-in
- 👨‍🏫 Role-based dashboards (Student, Lecturer, Admin)
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:5173

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React context (Auth)
├── hooks/           # Custom hooks (useGeolocation)
├── pages/           # Page components
│   ├── admin/       # Admin dashboard pages
│   ├── student/     # Student dashboard pages
│   └── lecturer/    # Lecturer dashboard pages
├── routes/          # Route protection
├── services/        # API services
├── types/           # TypeScript types
└── App.tsx          # Main app component
```

## Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

