const bcrypt = require('bcryptjs');
const { dbAsync, initDatabase } = require('./database');

const seedData = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();

    console.log('Seeding data...');

    // Check if data already exists
    const existingUsers = await dbAsync.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      console.log('Database already seeded. Skipping...');
      process.exit(0);
    }

    // Create sample lecturer
    const lecturerPassword = await bcrypt.hash('password123', 10);
    const lecturerResult = await dbAsync.run(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['Dr. John Smith', 'john.smith@university.edu', lecturerPassword, 'lecturer']);
    
    const lecturerId = lecturerResult.id;
    console.log('Created lecturer:', lecturerId);

    // Create sample admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await dbAsync.run(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['Admin User', 'admin@university.edu', adminPassword, 'admin']);
    console.log('Created admin user');

    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 10);
    await dbAsync.run(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['Alice Johnson', 'alice@student.edu', studentPassword, 'student']);
    console.log('Created student user');

    // Create 10 courses
    const courses = [
      {
        name: 'Introduction to Computer Science',
        code: 'CS101',
        description: 'Fundamental concepts of computer science including algorithms, data structures, and programming basics.'
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        description: 'Advanced data structures including trees, graphs, and algorithm analysis techniques.'
      },
      {
        name: 'Database Management Systems',
        code: 'CS301',
        description: 'Relational database design, SQL, normalization, and transaction management.'
      },
      {
        name: 'Web Development',
        code: 'CS250',
        description: 'Full-stack web development with HTML, CSS, JavaScript, Node.js, and database integration.'
      },
      {
        name: 'Machine Learning Fundamentals',
        code: 'CS401',
        description: 'Introduction to machine learning algorithms, neural networks, and deep learning concepts.'
      },
      {
        name: 'Software Engineering',
        code: 'CS350',
        description: 'Software development lifecycle, agile methodologies, testing, and project management.'
      },
      {
        name: 'Computer Networks',
        code: 'CS320',
        description: 'Network protocols, TCP/IP, routing, and network security fundamentals.'
      },
      {
        name: 'Operating Systems',
        code: 'CS310',
        description: 'Process management, memory management, file systems, and concurrency.'
      },
      {
        name: 'Artificial Intelligence',
        code: 'CS410',
        description: 'AI search algorithms, knowledge representation, planning, and natural language processing.'
      },
      {
        name: 'Cybersecurity Fundamentals',
        code: 'CS330',
        description: 'Security principles, cryptography, threat analysis, and defensive programming.'
      }
    ];

    for (const course of courses) {
      await dbAsync.run(`
        INSERT INTO courses (name, code, description, lecturer_id)
        VALUES (?, ?, ?, ?)
      `, [course.name, course.code, course.description, lecturerId]);
    }
    console.log(`Created ${courses.length} courses`);

    console.log('\\n✅ Database seeded successfully!');
    console.log('\\nSample login credentials:');
    console.log('  Lecturer: john.smith@university.edu / password123');
    console.log('  Admin:    admin@university.edu / admin123');
    console.log('  Student:  alice@student.edu / student123');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
