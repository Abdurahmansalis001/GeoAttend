
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { calculateDistance } = require('../utils/haversine');
const { dbAsync } = require('../database');
const router = express.Router();

// Start attendance session (lecturer only)
router.post('/session/start', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const { courseId, location, radius, duration = 60 } = req.body;

    if (!courseId || !location || !radius) {
      return res.status(400).json({ 
        message: 'Course ID, location (lat, lng), and radius are required' 
      });
    }

    // Verify course exists and belongs to lecturer
    const course = await dbAsync.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.lecturer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only create sessions for your own courses' });
    }

    // Deactivate any existing active sessions for this course
    await dbAsync.run(
      'UPDATE attendance_sessions SET active = 0, end_time = CURRENT_TIMESTAMP WHERE course_id = ? AND active = 1',
      [courseId]
    );

    // Create new session
    const result = await dbAsync.run(
      `INSERT INTO attendance_sessions 
       (course_id, lecturer_id, latitude, longitude, radius, duration, active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [courseId, req.user.id, location.lat, location.lng, radius, duration]
    );

    const session = await dbAsync.get(
      `SELECT s.*, c.name as course_name, c.code as course_code, u.name as lecturer_name
       FROM attendance_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN users u ON s.lecturer_id = u.id
       WHERE s.id = ?`,
      [result.id]
    );

    // Auto-expire session after duration
    setTimeout(async () => {
      await dbAsync.run(
        'UPDATE attendance_sessions SET active = 0, end_time = CURRENT_TIMESTAMP WHERE id = ?',
        [result.id]
      );
    }, parseInt(duration) * 60 * 1000);

    res.status(201).json({
      message: 'Attendance session started successfully',
      session: {
        id: session.id,
        courseId: session.course_id,
        lecturerId: session.lecturer_id,
        location: { lat: session.latitude, lng: session.longitude },
        radius: session.radius,
        startTime: session.start_time,
        endTime: session.end_time,
        active: !!session.active,
        duration: session.duration,
        course: session.course_name ? {
          id: session.course_id,
          name: session.course_name,
          code: session.course_code
        } : null,
        lecturer: session.lecturer_name ? {
          id: session.lecturer_id,
          name: session.lecturer_name
        } : null
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stop attendance session (lecturer only)
router.post('/session/stop', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await dbAsync.get('SELECT * FROM attendance_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.lecturer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only stop your own sessions' });
    }

    await dbAsync.run(
      'UPDATE attendance_sessions SET active = 0, end_time = CURRENT_TIMESTAMP WHERE id = ?',
      [sessionId]
    );

    const updatedSession = await dbAsync.get(
      `SELECT s.*, c.name as course_name, c.code as course_code
       FROM attendance_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.id = ?`,
      [sessionId]
    );

    res.json({
      message: 'Attendance session stopped successfully',
      session: {
        id: updatedSession.id,
        courseId: updatedSession.course_id,
        location: { lat: updatedSession.latitude, lng: updatedSession.longitude },
        radius: updatedSession.radius,
        startTime: updatedSession.start_time,
        endTime: updatedSession.end_time,
        active: !!updatedSession.active,
        course: updatedSession.course_name ? {
          id: updatedSession.course_id,
          name: updatedSession.course_name,
          code: updatedSession.course_code
        } : null
      }
    });
  } catch (error) {
    console.error('Stop session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active sessions
router.get('/session/active', authenticateToken, async (req, res) => {
  try {
    const sessions = await dbAsync.all(`
      SELECT s.*, c.name as course_name, c.code as course_code, u.name as lecturer_name,
             (SELECT COUNT(*) FROM attendance_records WHERE session_id = s.id) as attendance_count
      FROM attendance_sessions s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.lecturer_id = u.id
      WHERE s.active = 1
      ORDER BY s.start_time DESC
    `);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      courseId: session.course_id,
      lecturerId: session.lecturer_id,
      location: { lat: session.latitude, lng: session.longitude },
      radius: session.radius,
      startTime: session.start_time,
      endTime: session.end_time,
      active: !!session.active,
      duration: session.duration,
      attendanceCount: session.attendance_count,
      course: session.course_name ? {
        id: session.course_id,
        name: session.course_name,
        code: session.course_code
      } : null,
      lecturer: session.lecturer_name ? {
        id: session.lecturer_id,
        name: session.lecturer_name
      } : null
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get session by course
router.get('/session/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const sessions = await dbAsync.all(
      'SELECT * FROM attendance_sessions WHERE course_id = ? ORDER BY start_time DESC',
      [req.params.courseId]
    );
    
    res.json(sessions.map(s => ({
      id: s.id,
      courseId: s.course_id,
      lecturerId: s.lecturer_id,
      location: { lat: s.latitude, lng: s.longitude },
      radius: s.radius,
      startTime: s.start_time,
      endTime: s.end_time,
      active: !!s.active,
      duration: s.duration
    })));
  } catch (error) {
    console.error('Get course sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student check-in
router.post('/checkin', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { sessionId, location } = req.body;

    if (!sessionId || !location) {
      return res.status(400).json({ 
        message: 'Session ID and location (lat, lng) are required' 
      });
    }

    // Find session
    const session = await dbAsync.get(
      'SELECT * FROM attendance_sessions WHERE id = ?',
      [sessionId]
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!session.active) {
      return res.status(400).json({ message: 'This attendance session is not active' });
    }

    // Check if already checked in
    const existingRecord = await dbAsync.get(
      'SELECT * FROM attendance_records WHERE session_id = ? AND student_id = ?',
      [sessionId, req.user.id]
    );
    
    if (existingRecord) {
      return res.status(400).json({ message: 'You have already checked in for this session' });
    }

    // Calculate distance
    const distance = calculateDistance(
      session.latitude,
      session.longitude,
      parseFloat(location.lat),
      parseFloat(location.lng)
    );

    // Check if within radius
    if (distance > session.radius) {
      return res.status(403).json({
        message: 'You are outside the allowed attendance area',
        distance: Math.round(distance),
        allowedRadius: session.radius,
        unit: 'meters'
      });
    }

    // Create attendance record
    const result = await dbAsync.run(
      `INSERT INTO attendance_records 
       (student_id, session_id, course_id, latitude, longitude, distance, verified) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [req.user.id, sessionId, session.course_id, location.lat, location.lng, Math.round(distance)]
    );

    const record = await dbAsync.get(
      `SELECT ar.*, u.name as student_name, u.email as student_email, c.name as course_name, c.code as course_code
       FROM attendance_records ar
       LEFT JOIN users u ON ar.student_id = u.id
       LEFT JOIN courses c ON ar.course_id = c.id
       WHERE ar.id = ?`,
      [result.id]
    );

    res.json({
      message: 'Attendance recorded successfully',
      record: {
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
        } : null
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance records for a session (lecturer only)
router.get('/session/:sessionId/records', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const session = await dbAsync.get(
      'SELECT * FROM attendance_sessions WHERE id = ?',
      [req.params.sessionId]
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.lecturer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await dbAsync.all(`
      SELECT ar.*, u.name as student_name, u.email as student_email
      FROM attendance_records ar
      LEFT JOIN users u ON ar.student_id = u.id
      WHERE ar.session_id = ?
      ORDER BY ar.timestamp DESC
    `, [req.params.sessionId]);

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
      } : null
    })));
  } catch (error) {
    console.error('Get session records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my attendance (student)
router.get('/my-attendance', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const records = await dbAsync.all(`
      SELECT ar.*, c.name as course_name, c.code as course_code,
             s.latitude as session_lat, s.longitude as session_lng, s.start_time as session_start
      FROM attendance_records ar
      LEFT JOIN courses c ON ar.course_id = c.id
      LEFT JOIN attendance_sessions s ON ar.session_id = s.id
      WHERE ar.student_id = ?
      ORDER BY ar.timestamp DESC
    `, [req.user.id]);

    res.json(records.map(record => ({
      id: record.id,
      studentId: record.student_id,
      sessionId: record.session_id,
      courseId: record.course_id,
      timestamp: record.timestamp,
      location: { lat: record.latitude, lng: record.longitude },
      distance: record.distance,
      verified: !!record.verified,
      course: record.course_name ? {
        id: record.course_id,
        name: record.course_name,
        code: record.course_code
      } : null,
      session: {
        id: record.session_id,
        startTime: record.session_start,
        location: { lat: record.session_lat, lng: record.session_lng }
      }
    })));
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance stats for a course
router.get('/stats/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const course = await dbAsync.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only lecturer of the course or admin can view stats
    if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalSessions = await dbAsync.get(
      'SELECT COUNT(*) as count FROM attendance_sessions WHERE course_id = ?',
      [courseId]
    );

    const activeSessions = await dbAsync.get(
      'SELECT COUNT(*) as count FROM attendance_sessions WHERE course_id = ? AND active = 1',
      [courseId]
    );

    const totalAttendances = await dbAsync.get(
      'SELECT COUNT(*) as count FROM attendance_records WHERE course_id = ?',
      [courseId]
    );

    const students = await dbAsync.all("SELECT * FROM users WHERE role = 'student'");
    
    const studentStats = [];
    for (const student of students) {
      const attendanceCount = await dbAsync.get(
        'SELECT COUNT(*) as count FROM attendance_records WHERE course_id = ? AND student_id = ?',
        [courseId, student.id]
      );
      
      studentStats.push({
        student: {
          id: student.id,
          name: student.name,
          email: student.email
        },
        attendanceCount: attendanceCount.count,
        attendanceRate: totalSessions.count > 0 
          ? Math.round((attendanceCount.count / totalSessions.count) * 100) 
          : 0
      });
    }

    res.json({
      course: {
        id: course.id,
        name: course.name,
        code: course.code
      },
      totalSessions: totalSessions.count,
      activeSessions: activeSessions.count,
      totalAttendances: totalAttendances.count,
      averageAttendance: totalSessions.count > 0 
        ? Math.round((totalAttendances.count / (totalSessions.count * students.length)) * 100) 
        : 0,
      studentStats
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
