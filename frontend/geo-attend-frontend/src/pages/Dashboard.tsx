

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import { Layout, StatCard, Card, CardHeader, CardTitle, CardContent, Alert } from '../components';
import { getSystemStats, getActiveSessions, getCourses } from '../services/api';
import { 
  Users, 
  BookOpen, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceSession, Course } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active sessions for all users
        const sessionsData = await getActiveSessions();
        setActiveSessions(sessionsData);
        
        // Fetch courses
        const coursesData = await getCourses();
        setCourses(coursesData);
        
        // Fetch admin stats if admin
        if (user?.role === 'admin') {
          const statsData = await getSystemStats();
          setStats(statsData);
        }
      } catch (err: any) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh active sessions every 30 seconds
    const interval = setInterval(() => {
      getActiveSessions().then(setActiveSessions).catch(console.error);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user?.role]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getQuickActions = () => {
    if (user?.role === 'student') {
      return [
        { label: 'View My Attendance', path: '/student', icon: CheckCircle },
        { label: 'Browse Courses', path: '/student/courses', icon: BookOpen },
      ];
    }
    if (user?.role === 'lecturer') {
      return [
        { label: 'Start Session', path: '/lecturer', icon: MapPin },
        { label: 'My Courses', path: '/lecturer/courses', icon: BookOpen },
      ];
    }
    return [
      { label: 'Manage Users', path: '/admin/users', icon: Users },
      { label: 'View Reports', path: '/admin', icon: Calendar },
    ];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getWelcomeMessage()}, {user?.name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening in your GeoAttend dashboard today.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Stats Grid */}
        {user?.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Students"
              value={stats.users.students}
              icon={GraduationCap}
              color="green"
            />
            <StatCard
              title="Courses"
              value={stats.courses.total}
              icon={BookOpen}
              color="purple"
            />
            <StatCard
              title="Active Sessions"
              value={stats.sessions.active}
              icon={MapPin}
              color="orange"
            />
          </div>
        )}

        {user?.role === 'lecturer' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="My Courses"
              value={courses.filter(c => c.lecturerId === user.id).length}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Active Sessions"
              value={activeSessions.filter(s => s.lecturerId === user.id).length}
              icon={MapPin}
              color="green"
            />
            <StatCard
              title="Total Attendance"
              value={activeSessions
                .filter(s => s.lecturerId === user.id)
                .reduce((acc, s) => acc + (s.attendanceCount || 0), 0)}
              icon={Users}
              color="purple"
            />
          </div>
        )}

        {user?.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="My Courses"
              value={courses.length}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Active Sessions"
              value={activeSessions.length}
              icon={MapPin}
              color="green"
            />
            <StatCard
              title="Available to Check-in"
              value={activeSessions.filter(s => 
                courses.some(c => c.id === s.courseId)
              ).length}
              icon={CheckCircle}
              color="purple"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Active Attendance Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No active attendance sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {session.course?.name || 'Unknown Course'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {session.course?.code} • {session.lecturer?.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(session.startTime), 'HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {session.radius}m radius
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {session.attendanceCount || 0} checked in
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getQuickActions().map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.path}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};