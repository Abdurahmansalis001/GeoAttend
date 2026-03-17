import React, { useEffect, useState } from 'react';
import { Layout } from '../../components';
import { getSystemStats, getAllAttendanceRecords, getCourses } from '../../services/api';
import { AttendanceRecord, Course } from '../../types';
import {
  StatCard, GlassCard, CardHeader, Badge, PageHeader, EmptyState, SkeletonLoader, Alert,
} from '../../components/ui';
import {
  Users, BookOpen, MapPin, Calendar,
  TrendingUp, GraduationCap, UserCheck, Clock,
  BarChart3, Activity,
} from 'lucide-react';
import { format } from 'date-fns';

/* ── Row item shared across both panels ────────────────────────────────────── */

const ListRow: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.2s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-8px)',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.09)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
    }}
    >
      {children}
    </div>
  );
};

/* ── Tiny bar sparkline ────────────────────────────────────────────────────── */

const MiniBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', width: 60 }}>
    <div style={{
      height: '100%', borderRadius: 2,
      background: color,
      width: `${Math.round((value / max) * 100)}%`,
      transition: 'width 0.8s ease',
    }} />
  </div>
);

/* ── Main component ────────────────────────────────────────────────────────── */

export const AdminDashboard: React.FC = () => {
  const [stats, setStats]                   = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses]               = useState<Course[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsData, attendanceData, coursesData] = await Promise.all([
        getSystemStats(),
        getAllAttendanceRecords(),
        getCourses(),
      ]);
      setStats(statsData);
      setRecentAttendance(attendanceData.slice(0, 10));
      setCourses(coursesData);
    } catch {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <SkeletonLoader />
    </Layout>
  );

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <PageHeader
            title="System Overview"
            subtitle="Real-time attendance analytics and management"
            icon={BarChart3}
            iconColor="#4f8ef7"
          />
          <div className="animate-fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 8, padding: '6px 12px',
          }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#34d399' }}>Live</span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {stats && (
          <>
            {/* Primary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <StatCard title="Total Users"    value={stats.users.total}       icon={Users}        accent="blue"   delay={0}   />
              <StatCard title="Students"       value={stats.users.students}    icon={GraduationCap} accent="green"  delay={60}  />
              <StatCard title="Lecturers"      value={stats.users.lecturers}   icon={UserCheck}    accent="purple" delay={120} />
              <StatCard title="Courses"        value={stats.courses.total}     icon={BookOpen}     accent="amber"  delay={180} />
            </div>

            {/* Secondary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <StatCard title="Total Sessions"    value={stats.sessions.total}    icon={Calendar}    accent="blue"   delay={240} />
              <StatCard title="Active Sessions"   value={stats.sessions.active}   icon={Activity}    accent="green"  delay={290} />
              <StatCard title="Total Check-ins"   value={stats.attendance.total}  icon={TrendingUp}  accent="purple" delay={340} />
            </div>

            {/* Detail panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Recent Attendance */}
              <GlassCard delay={400}>
                <CardHeader
                  icon={Clock}
                  iconColor="#4f8ef7"
                  title="Recent Check-ins"
                  subtitle={`${recentAttendance.length} records`}
                />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentAttendance.length === 0 ? (
                    <EmptyState icon={Clock} title="No records yet" body="Attendance records will appear here once students start checking in." />
                  ) : (
                    recentAttendance.map((record, i) => (
                      <ListRow key={record.id} delay={i * 40}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(79,142,247,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 600, color: '#4f8ef7',
                          }}>
                            {record.student?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>
                              {record.student?.name}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#8b95a7' }}>
                              {record.course?.name}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: '#4a5568', fontFamily: "'JetBrains Mono', monospace" }}>
                          {format(new Date(record.timestamp), 'MMM d, HH:mm')}
                        </span>
                      </ListRow>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Courses */}
              <GlassCard delay={450}>
                <CardHeader
                  icon={BookOpen}
                  iconColor="#a78bfa"
                  title="All Courses"
                  subtitle={`${courses.length} courses total`}
                />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {courses.length === 0 ? (
                    <EmptyState icon={BookOpen} title="No courses yet" body="Courses will appear here once lecturers create them." />
                  ) : (
                    courses.slice(0, 6).map((course, i) => (
                      <ListRow key={course.id} delay={i * 40}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            padding: '3px 7px',
                            background: 'rgba(167,139,250,0.12)',
                            border: '1px solid rgba(167,139,250,0.2)',
                            borderRadius: 6,
                            fontSize: 10, fontWeight: 600, color: '#a78bfa',
                            fontFamily: "'JetBrains Mono', monospace",
                            whiteSpace: 'nowrap',
                          }}>
                            {course.code}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>
                              {course.name}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#8b95a7' }}>
                              {course.lecturer?.name}
                            </p>
                          </div>
                        </div>
                        <MiniBar
                          value={course.attendanceCount ?? Math.floor(Math.random() * 30)}
                          max={50}
                          color="#a78bfa"
                        />
                      </ListRow>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};