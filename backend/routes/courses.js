const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { dbAsync } = require('../database');
const router = express.Router();

// Get all courses (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await dbAsync.all(`
      SELECT c.*, u.name as lecturer_name, u.email as lecturer_email
      FROM courses c
      LEFT JOIN users u ON c.lecturer_id = u.id
      ORDER BY c.created_at DESC
    `);
    
    const formattedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      lecturerId: course.lecturer_id,
      createdAt: course.created_at,
      lecturer: course.lecturer_name ? {
        id: course.lecturer_id,
        name: course.lecturer_name,
        email: course.lecturer_email
      } : null
    }));
    
    res.json(formattedCourses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create course (lecturer or admin only)
router.post('/', authenticateToken, authorizeRole('lecturer', 'admin'), async (req, res) => {
  try {
    const { name, code, description, lecturerId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Course name and code are required' });
    }

    // Check if course code exists
    const existingCourse = await dbAsync.get('SELECT * FROM courses WHERE code = ?', [code]);
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const actualLecturerId = req.user.role === 'lecturer' ? req.user.id : (lecturerId || req.user.id);

    const result = await dbAsync.run(
      'INSERT INTO courses (name, code, description, lecturer_id) VALUES (?, ?, ?, ?)',
      [name, code, description || '', actualLecturerId]
    );

    const newCourse = await dbAsync.get(
      'SELECT c.*, u.name as lecturer_name, u.email as lecturer_email FROM courses c LEFT JOIN users u ON c.lecturer_id = u.id WHERE c.id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: newCourse.id,
        name: newCourse.name,
        code: newCourse.code,
        description: newCourse.description,
        lecturerId: newCourse.lecturer_id,
        createdAt: newCourse.created_at,
        lecturer: newCourse.lecturer_name ? {
          id: newCourse.lecturer_id,
          name: newCourse.lecturer_name,
          email: newCourse.lecturer_email
        } : null
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single course
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await dbAsync.get(`
      SELECT c.*, u.name as lecturer_name, u.email as lecturer_email
      FROM courses c
      LEFT JOIN users u ON c.lecturer_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      lecturerId: course.lecturer_id,
      createdAt: course.created_at,
      lecturer: course.lecturer_name ? {
        id: course.lecturer_id,
        name: course.lecturer_name,
        email: course.lecturer_email
      } : null
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
