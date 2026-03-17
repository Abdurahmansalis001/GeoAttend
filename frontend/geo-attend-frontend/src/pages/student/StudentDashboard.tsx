import React, { useEffect, useState } from 'react';
import { Layout } from '../../components';
import { getActiveSessions, checkInAttendance, getMyAttendance, getCourses } from '../../services/api';
import { useGeolocation } from '../../hooks/geoLocation';
import { AttendanceSession, AttendanceRecord, Course } from '../../types';
import {
  StatCard, GlassCard, CardHeader, Badge, PageHeader, EmptyState, Alert, ActionButton,
} from '../../components/ui';
import {
  MapPin, CheckCircle, Clock, BookOpen,
  Navigation, Loader2, GraduationCap, Radio, Zap,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

/* ── Session check-in card ─────────────────────────────────────────────────── */

const SessionCard: React.FC<{
  session: AttendanceSession;
  checkedIn: boolean;
  onCheckIn: () => void;
  loading: boolean;
  geoLoading: boolean;
  index: number;
}> = ({ session, checkedIn, onCheckIn, loading, geoLoading, index }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div style={{
      background: checkedIn
        ? 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(52,211,153,0.04) 100%)'
        : 'rgba(255,255,255,0.025)',
      border: checkedIn
        ? '1px solid rgba(52,211,153,0.25)'
        : '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      transition: 'all 0.25s ease',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(10px)',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      if (!checkedIn) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,142,247,0.35)';
    }}
    onMouseLeave={e => {
      if (!checkedIn) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
    }}
    >
      {/* Left content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
            {session.course?.name}
          </p>
          {checkedIn
            ? <Badge label="Checked In" accent="green" />
            : <Badge label="Live" accent="blue" live />
          }
        </div>

        <p style={{ margin: '0 0 10px', fontSize: 12, color: '#8b95a7' }}>
          {session.course?.code} · {session.lecturer?.name}
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4a5568' }}>
            <Clock size={13} strokeWidth={1.8} />
            Started {formatDistanceToNow(new Date(session.startTime))} ago
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4a5568' }}>
            <Navigation size={13} strokeWidth={1.8} />
            {session.radius}m radius
          </span>
        </div>
      </div>

      {/* Check-in button */}
      {!checkedIn && (
        <ActionButton
          onClick={onCheckIn}
          loading={loading || geoLoading}
          disabled={loading || geoLoading}
          size="sm"
        >
          <Zap size={13} strokeWidth={2} />
          Check In
        </ActionButton>
      )}

      {checkedIn && (
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(52,211,153,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <CheckCircle size={16} color="#34d399" strokeWidth={2} />
        </div>
      )}
    </div>
  );
};

/* ── Main component ────────────────────────────────────────────────────────── */

export const StudentDashboard: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [myAttendance, setMyAttendance]     = useState<AttendanceRecord[]>([]);
  const [courses, setCourses]               = useState<Course[]>([]);
  const [loading, setLoading]               = useState(true);
  const [checkInLoading, setCheckInLoading] = useState<number | null>(null);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');

  const { getCurrentPosition, loading: geoLoading, error: geoError, clearError: clearGeoError } = useGeolocation();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsData, attendanceData, coursesData] = await Promise.all([
        getActiveSessions(), getMyAttendance(), getCourses(),
      ]);
      setActiveSessions(sessionsData);
      setMyAttendance(attendanceData);
      setCourses(coursesData);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (sessionId: number) => {
    setCheckInLoading(sessionId);
    setError(''); setSuccess(''); clearGeoError();
    try {
      const location = await getCurrentPosition();
      const res = await checkInAttendance({ sessionId, location });
      setSuccess(res.message);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Check-in failed');
    } finally {
      setCheckInLoading(null);
    }
  };

  const hasCheckedIn = (id: number) => myAttendance.some(r => r.sessionId === id);
  const mySessions   = activeSessions.filter(s => courses.some(c => c.id === s.courseId));

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
        <Loader2 size={32} color="#4f8ef7" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {/* Header */}
        <PageHeader
          title="My Attendance"
          subtitle="Check in to active sessions and track your history"
          icon={GraduationCap}
          iconColor="#34d399"
        />

        {/* Alerts */}
        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        {geoError && <Alert type="error"  message={geoError} onClose={clearGeoError}        />}

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <StatCard title="Total Present"    value={myAttendance.length}  icon={CheckCircle} accent="green"  delay={0}   />
          <StatCard title="Active Sessions"  value={mySessions.length}    icon={Radio}       accent="blue"   delay={60}  />
          <StatCard title="My Courses"       value={courses.length}       icon={BookOpen}    accent="purple" delay={120} />
        </div>

        {/* Active sessions */}
        <GlassCard delay={200}>
          <CardHeader
            icon={MapPin}
            iconColor="#34d399"
            title="Available Check-ins"
            subtitle={mySessions.length === 0 ? 'None right now' : `${mySessions.length} session${mySessions.length !== 1 ? 's' : ''} open`}
          />
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mySessions.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No active sessions"
                body="Your lecturer hasn't started an attendance session yet. Check back soon."
                iconColor="#4f8ef7"
              />
            ) : (
              mySessions.map((session, i) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  checkedIn={hasCheckedIn(session.id)}
                  onCheckIn={() => handleCheckIn(session.id)}
                  loading={checkInLoading === session.id}
                  geoLoading={geoLoading}
                  index={i}
                />
              ))
            )}
          </div>
        </GlassCard>

        {/* Attendance history table */}
        <GlassCard delay={300}>
          <CardHeader
            icon={CheckCircle}
            iconColor="#4f8ef7"
            title="Attendance History"
            subtitle={`${myAttendance.length} record${myAttendance.length !== 1 ? 's' : ''}`}
          />
          <div style={{ padding: '0 20px 20px' }}>
            {myAttendance.length === 0 ? (
              <EmptyState icon={BookOpen} title="No records yet" body="Your attendance records will show here after you check in." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
                  <thead>
                    <tr>
                      {['Course', 'Date', 'Time', 'Status'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '14px 12px 10px',
                          fontSize: 11, fontWeight: 600, color: '#4a5568',
                          letterSpacing: '0.07em', textTransform: 'uppercase',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendance.slice(0, 10).map((record, i) => (
                      <tr
                        key={record.id}
                        style={{
                          borderBottom: i < myAttendance.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td style={{ padding: '13px 12px' }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>
                            {record.course?.name}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: '#4a5568', fontFamily: "'JetBrains Mono', monospace" }}>
                            {record.course?.code}
                          </p>
                        </td>
                        <td style={{ padding: '13px 12px', fontSize: 13, color: '#8b95a7' }}>
                          {format(new Date(record.timestamp), 'MMM d, yyyy')}
                        </td>
                        <td style={{ padding: '13px 12px', fontSize: 12, color: '#8b95a7', fontFamily: "'JetBrains Mono', monospace" }}>
                          {format(new Date(record.timestamp), 'HH:mm')}
                        </td>
                        <td style={{ padding: '13px 12px' }}>
                          <Badge label="Present" accent="green" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};