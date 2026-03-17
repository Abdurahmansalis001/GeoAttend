
import axios, { AxiosError } from 'axios';
import { User, Course, AttendanceSession, AttendanceRecord, AuthResponse } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string
): Promise<AuthResponse> => {
  const response = await api.post('/register', { name, email, password, role });
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/profile');
  return response.data;
};

// Courses API
export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourse = async (id: number): Promise<Course> => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData: {
  name: string;
  code: string;
  description?: string;
  lecturerId?: number;
}): Promise<{ message: string; course: Course }> => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

// Attendance Session API
export const createSession = async (sessionData: {
  courseId: number;
  location: { lat: number; lng: number };
  radius: number;
  duration?: number;
}): Promise<{ message: string; session: AttendanceSession }> => {
  const response = await api.post('/attendance/session/start', sessionData);
  return response.data;
};

export const stopSession = async (sessionId: number): Promise<{ message: string; session: AttendanceSession }> => {
  const response = await api.post('/attendance/session/stop', { sessionId });
  return response.data;
};

export const getActiveSessions = async (): Promise<AttendanceSession[]> => {
  const response = await api.get('/attendance/session/active');
  return response.data;
};

export const getSessionRecords = async (sessionId: number): Promise<AttendanceRecord[]> => {
  const response = await api.get(`/attendance/session/${sessionId}/records`);
  return response.data;
};

// Attendance Check-in API
export const checkInAttendance = async (checkInData: {
  sessionId: number;
  location: { lat: number; lng: number };
}): Promise<{ message: string; record: AttendanceRecord }> => {
  const response = await api.post('/attendance/checkin', checkInData);
  return response.data;
};

export const getMyAttendance = async (): Promise<AttendanceRecord[]> => {
  const response = await api.get('/attendance/my-attendance');
  return response.data;
};

// Admin API
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getSystemStats = async (): Promise<any> => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const response = await api.get('/admin/attendance-records');
  return response.data;
};

export default api;
