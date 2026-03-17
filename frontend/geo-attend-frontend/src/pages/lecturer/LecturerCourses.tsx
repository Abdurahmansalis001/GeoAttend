

import React, { useEffect, useState } from 'react';
import { Layout, Card, CardHeader, CardTitle, CardContent, Button, Input, Alert } from '../../components';
import { createCourse, getCourses } from '../../services/api';
import { useAuth } from '../../context/authContext';
import { Course } from '../../types';
import { BookOpen, Plus, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const LecturerCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    description: ''
  });

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      await createCourse(newCourse);
      setSuccess('Course created successfully!');
      setNewCourse({ name: '', code: '', description: '' });
      setShowForm(false);
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const myCourses = courses.filter(c => c.lecturerId === user?.id);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Manage your courses</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Course'}
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Create Course Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Course Name"
                    required
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                  <Input
                    label="Course Code"
                    required
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    placeholder="e.g., CS101"
                  />
                </div>
                <Input
                  label="Description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Brief description of the course"
                />
                <div className="flex gap-3">
                  <Button type="submit" loading={creating}>
                    Create Course
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
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
                    <Clock className="w-4 h-4" />
                    Created {format(new Date(course.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myCourses.length === 0 && !showForm && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-4">Create your first course to start taking attendance.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};