import React, { useEffect, useState } from 'react';
import { Layout, Card, CardHeader, CardTitle, CardContent, Alert } from '../../components';
import { getCourses } from '../../services/api';
import { Course } from '../../types';
import { BookOpen, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">View all available courses</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {course.code}
                </p>
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {course.lecturer?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(course.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-500">Check back later for new courses.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};