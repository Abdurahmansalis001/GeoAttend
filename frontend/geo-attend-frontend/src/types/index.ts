
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  createdAt: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  lecturerId: number;
  lecturer?: User;
  createdAt: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface AttendanceSession {
  id: number;
  courseId: number;
  lecturerId: number;
  location: Location;
  radius: number;
  startTime: string;
  endTime: string | null;
  active: boolean;
  duration: number;
  course?: Course;
  lecturer?: User;
  attendanceCount?: number;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  sessionId: number;
  courseId: number;
  timestamp: string;
  location: Location;
  distance: number;
  verified: boolean;
  student?: User;
  course?: Course;
  session?: AttendanceSession;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}
