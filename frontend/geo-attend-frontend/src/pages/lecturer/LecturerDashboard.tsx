import React, { useEffect, useState } from 'react';
import { Layout } from '../../components';
import { createSession, stopSession, getActiveSessions, getSessionRecords, getCourses } from '../../services/api';
import { useGeolocation } from '../../hooks/geoLocation';
import { AttendanceSession, AttendanceRecord, Course } from '../../types';
import {
  StatCard, GlassCard, CardHeader, Badge, PageHeader, EmptyState, Alert, ActionButton,
  FormField, StyledInput, StyledSelect,
} from '../../components/ui';
import {
  MapPin, Play, Square, Users, Clock, Navigation,
  CheckCircle, Loader2, Radio, Wifi, UserCheck, BookOpen,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

/* ── Live session card ─────────────────────────────────────────────────────── */

const ActiveSessionCard: React.FC<{
  session: AttendanceSession;
  onStop: () => void;
  onView: () => void;
  stopping: boolean;
  index: number;
}> = ({ session, onStop, onView, stopping, index }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 100);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(79,142,247,0.07) 0%, rgba(79,142,247,0.03) 100%)',
      border: '1px solid rgba(79,142,247,0.2)',
      borderRadius: 14,
      padding: '18px 20px',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.3s ease',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
              {session.course?.name}
            </p>
            <Badge label="Live" accent="green" live />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#8b95a7' }}>{session.course?.code}</p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <ActionButton variant="ghost" size="sm" onClick={onView}>
            <Users size={13} />
            View
          </ActionButton>
          <ActionButton variant="danger" size="sm" onClick={onStop} loading={stopping}>
            <Square size={11} />
            Stop
          </ActionButton>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {[
          { label: 'Started',       value: formatDistanceToNow(new Date(session.startTime)) + ' ago', icon: Clock },
          { label: 'Checked in',    value: `${session.attendanceCount ?? 0} students`,                icon: Users },
          { label: 'Radius',        value: `${session.radius}m`,                                     icon: Navigation },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8, padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon size={11} color="#4f8ef7" strokeWidth={2} />
              <span style={{ fontSize: 10, color: '#4a5568', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Attendance record row ─────────────────────────────────────────────────── */

const AttendeeRow: React.FC<{ record: AttendanceRecord; index: number }> = ({ record, index }) => {
  const [v, setV] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setV(true), index * 50); return () => clearTimeout(t); }, [index]);
  return (
    <tr style={{
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      opacity: v ? 1 : 0, transition: 'opacity 0.25s ease',
    }}
    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'}
    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
    >
      <td style={{ padding: '11px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(79,142,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#4f8ef7',
          }}>
            {record.student?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{record.student?.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#4a5568' }}>{record.student?.email}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '11px 12px', fontSize: 12, color: '#8b95a7', fontFamily: "'JetBrains Mono', monospace" }}>
        {format(new Date(record.timestamp), 'HH:mm:ss')}
      </td>
      <td style={{ padding: '11px 12px', fontSize: 12, color: '#8b95a7' }}>
        {record.distance != null ? `${record.distance}m` : '—'}
      </td>
      <td style={{ padding: '11px 12px' }}>
        <Badge label="Verified" accent="green" />
      </td>
    </tr>
  );
};

/* ── Main component ────────────────────────────────────────────────────────── */

export const LecturerDashboard: React.FC = () => {
  const [sessions, setSessions]             = useState<AttendanceSession[]>([]);
  const [courses, setCourses]               = useState<Course[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<AttendanceRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading]               = useState(true);
  const [creating, setCreating]             = useState(false);
  const [stopping, setStopping]             = useState<number | null>(null);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');

  const [form, setForm] = useState({ courseId: '', radius: '50', duration: '60' });

  const { getCurrentPosition, loading: geoLoading, error: geoError, clearError } = useGeolocation();

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, []);

  const fetchData = async () => {
    try {
      const [s, c] = await Promise.all([getActiveSessions(), getCourses()]);
      setSessions(s); setCourses(c);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setError(''); setSuccess(''); clearError();
    try {
      const location = await getCurrentPosition();
      await createSession({ courseId: parseInt(form.courseId), location, radius: parseInt(form.radius), duration: parseInt(form.duration) });
      setSuccess('Attendance session started!');
      setForm({ courseId: '', radius: '50', duration: '60' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start session');
    } finally { setCreating(false); }
  };

  const handleStop = async (id: number) => {
    setStopping(id); setError('');
    try { await stopSession(id); setSuccess('Session stopped'); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to stop'); }
    finally { setStopping(null); }
  };

  const viewRecords = async (id: number) => {
    try {
      const r = await getSessionRecords(id);
      setSelectedRecords(r); setSelectedSessionId(id);
    } catch { setError('Failed to load records'); }
  };

  const activeSessions = sessions.filter(s => s.active);

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
          title="Session Control"
          subtitle="Start, manage, and monitor attendance sessions"
          icon={Wifi}
          iconColor="#4f8ef7"
        />

        {/* Alerts */}
        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        {geoError && <Alert type="error"  message={geoError} onClose={clearError}          />}

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <StatCard title="My Courses"      value={courses.length}          icon={BookOpen}  accent="purple" delay={0}   />
          <StatCard title="Active Sessions" value={activeSessions.length}   icon={Radio}     accent="green"  delay={60}  />
          <StatCard title="Students Present" value={activeSessions.reduce((a, s) => a + (s.attendanceCount ?? 0), 0)} icon={UserCheck} accent="blue" delay={120} />
        </div>

        {/* Main 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Start session form */}
          <GlassCard delay={200}>
            <CardHeader icon={Play} iconColor="#34d399" title="Start Session" subtitle="Use your GPS location" />
            <form onSubmit={handleCreate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <FormField label="Course">
                <StyledSelect
                  required
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                >
                  <option value="">Select a course…</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                  ))}
                </StyledSelect>
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Radius (m)" hint="10 – 500 m">
                  <StyledInput
                    type="number" required min={10} max={500}
                    value={form.radius}
                    onChange={e => setForm({ ...form, radius: e.target.value })}
                  />
                </FormField>
                <FormField label="Duration (min)" hint="5 – 180 min">
                  <StyledInput
                    type="number" required min={5} max={180}
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                  />
                </FormField>
              </div>

              {/* GPS notice */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(79,142,247,0.08)',
                border: '1px solid rgba(79,142,247,0.15)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <Navigation size={16} color="#4f8ef7" strokeWidth={1.8} style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#8b95a7', lineHeight: 1.6 }}>
                  Your current GPS position will be used as the session centre. Be in the classroom before starting.
                </p>
              </div>

              <ActionButton
                type="submit"
                loading={creating || geoLoading}
                disabled={creating || geoLoading || !form.courseId}
              >
                <Radio size={14} strokeWidth={2} />
                Start Attendance Session
              </ActionButton>
            </form>
          </GlassCard>

          {/* Active sessions */}
          <GlassCard delay={260}>
            <CardHeader
              icon={MapPin}
              iconColor="#fbbf24"
              title="Active Sessions"
              subtitle={activeSessions.length === 0 ? 'None running' : `${activeSessions.length} running`}
            />
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeSessions.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No active sessions"
                  body="Start a session using the form to begin collecting attendance."
                  iconColor="#fbbf24"
                />
              ) : (
                activeSessions.map((s, i) => (
                  <ActiveSessionCard
                    key={s.id}
                    session={s}
                    onStop={() => handleStop(s.id)}
                    onView={() => viewRecords(s.id)}
                    stopping={stopping === s.id}
                    index={i}
                  />
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Attendance records panel */}
        {selectedSessionId !== null && (
          <GlassCard delay={0}>
            <CardHeader
              icon={Users}
              iconColor="#4f8ef7"
              title="Attendance Records"
              subtitle={`${selectedRecords.length} student${selectedRecords.length !== 1 ? 's' : ''} checked in`}
              action={
                <ActionButton variant="ghost" size="sm" onClick={() => setSelectedSessionId(null)}>
                  Close
                </ActionButton>
              }
            />
            <div style={{ padding: '0 20px 20px' }}>
              {selectedRecords.length === 0 ? (
                <EmptyState icon={Users} title="No check-ins yet" body="Students haven't checked in yet. Records will appear in real time." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
                    <thead>
                      <tr>
                        {['Student', 'Check-in Time', 'Distance', 'Status'].map(h => (
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
                      {selectedRecords.map((r, i) => (
                        <AttendeeRow key={r.id} record={r} index={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
};