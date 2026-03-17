const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { dbAsync } = require('../database');
const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await dbAsync.all(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system stats (admin only)
router.get('/stats', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const totalUsers = await dbAsync.get('SELECT COUNT(*) as count FROM users');
    const students = await dbAsync.get("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const lecturers = await dbAsync.get("SELECT COUNT(*) as count FROM users WHERE role = 'lecturer'");
    const admins = await dbAsync.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    
    const totalCourses = await dbAsync.get('SELECT COUNT(*) as count FROM courses');
    const totalSessions = await dbAsync.get('SELECT COUNT(*) as count FROM attendance_sessions');
    const activeSessions = await dbAsync.get('SELECT COUNT(*) as count FROM attendance_sessions WHERE active = 1');
    const totalAttendance = await dbAsync.get('SELECT COUNT(*) as count FROM attendance_records');

    res.json({
      users: {
        total: totalUsers.count,
        students: students.count,
        lecturers: lecturers.count,
        admins: admins.count
      },
      courses: {
        total: totalCourses.count
      },
      sessions: {
        total: totalSessions.count,
        active: activeSessions.count
      },
      attendance: {
        total: totalAttendance.count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendance records (admin only)
router.get('/attendance-records', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const records = await dbAsync.all(`
      SELECT ar.*, u.name as student_name, u.email as student_email,
             c.name as course_name, c.code as course_code
      FROM attendance_records ar
      LEFT JOIN users u ON ar.student_id = u.id
      LEFT JOIN courses c ON ar.course_id = c.id
      ORDER BY ar.timestamp DESC
      LIMIT 100
    `);

    res.json(records.map(record => ({
      id: record.id,
      studentId: record.student_id,
      sessionId: record.session_id,
      courseId: record.course_id,
      timestamp: record.timestamp,
      location: { lat: record.latitude, lng: record.longitude },
      distance: record.distance,
      verified: !!record.verified,
      student: record.student_name ? {
        id: record.student_id,
        name: record.student_name,
        email: record.student_email
      } : null,
      course: record.course_name ? {
        id: record.course_id,
        name: record.course_name,
        code: record.course_code
      } : null
    })));
  } catch (error) {
    console.error('Get attendance records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await dbAsync.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await dbAsync.run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
