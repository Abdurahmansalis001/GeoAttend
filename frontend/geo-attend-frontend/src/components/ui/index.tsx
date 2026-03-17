import React from 'react';

/* ── StatCard ──────────────────────────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  delta?: string;
  deltaPositive?: boolean;
  delay?: number;
}

const accentMap = {
  blue:   { bg: 'rgba(79,142,247,0.1)',  border: 'rgba(79,142,247,0.25)',  text: '#4f8ef7',  icon: 'rgba(79,142,247,0.15)'  },
  green:  { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  text: '#34d399',  icon: 'rgba(52,211,153,0.15)'  },
  amber:  { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  text: '#fbbf24',  icon: 'rgba(251,191,36,0.15)'  },
  purple: { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa',  icon: 'rgba(167,139,250,0.15)' },
  red:    { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', text: '#f87171',  icon: 'rgba(248,113,113,0.15)' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, icon: Icon, accent, delta, deltaPositive, delay = 0,
}) => {
  const a = accentMap[accent];
  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        background: '#16191f',
        border: `1px solid ${a.border}`,
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${a.bg}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#8b95a7', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          {title}
        </p>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: a.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} color={a.text} strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 600, color: '#f1f5f9', lineHeight: 1 }}>{value}</span>
        {delta && (
          <span style={{
            fontSize: 12, fontWeight: 500,
            color: deltaPositive ? '#34d399' : '#f87171',
          }}>
            {deltaPositive ? '↑' : '↓'} {delta}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── GlassCard ─────────────────────────────────────────────────────────────── */

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, delay = 0, style }) => (
  <div
    className="animate-fade-up"
    style={{
      animationDelay: `${delay}ms`,
      background: '#16191f',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── CardHeader ────────────────────────────────────────────────────────────── */

export const CardHeader: React.FC<{
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, iconColor, title, subtitle, action }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${iconColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{title}</p>
        {subtitle && <p style={{ margin: 0, fontSize: 12, color: '#8b95a7' }}>{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

/* ── Badge ─────────────────────────────────────────────────────────────────── */

export const Badge: React.FC<{
  label: string;
  accent: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  live?: boolean;
}> = ({ label, accent, live }) => {
  const colors = {
    green:  { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
    blue:   { bg: 'rgba(79,142,247,0.15)',  text: '#4f8ef7' },
    amber:  { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
    red:    { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
    purple: { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
  };
  const c = colors[accent];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      padding: '3px 8px', borderRadius: 6,
    }}>
      {live && <span className="live-dot" style={{ width: 6, height: 6 }} />}
      {label}
    </span>
  );
};

/* ── ActionButton ──────────────────────────────────────────────────────────── */

export const ActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}> = ({ children, onClick, variant = 'primary', size = 'md', disabled, loading, type = 'button' }) => {
  const styles = {
    primary: { bg: '#4f8ef7', hover: '#3d7ef0', color: '#fff', border: 'transparent' },
    danger:  { bg: 'rgba(248,113,113,0.15)', hover: 'rgba(248,113,113,0.25)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
    ghost:   { bg: 'rgba(255,255,255,0.06)', hover: 'rgba(255,255,255,0.1)', color: '#8b95a7', border: 'rgba(255,255,255,0.1)' },
  };
  const s = styles[variant];
  const pad = size === 'sm' ? '6px 12px' : '9px 18px';
  const fs  = size === 'sm' ? 12 : 14;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 8, padding: pad,
        fontSize: fs, fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!disabled && !loading) (e.currentTarget).style.background = s.hover; }}
      onMouseLeave={e => { (e.currentTarget).style.background = s.bg; }}
    >
      {loading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.7s linear infinite' }} /> : children}
    </button>
  );
};

/* ── FormField ─────────────────────────────────────────────────────────────── */

export const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, children, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: '#8b95a7', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#4a5568', margin: 0 }}>{hint}</p>}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1e2330',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  color: '#f1f5f9',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={inputStyle}
    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; }}
    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
  />
);

export const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select
    {...props}
    style={{ ...inputStyle, cursor: 'pointer' }}
    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; }}
    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
  >
    {children}
  </select>
);

/* ── Alert ─────────────────────────────────────────────────────────────────── */

export const Alert: React.FC<{ type: 'error' | 'success'; message: string; onClose?: () => void }> = ({
  type, message, onClose,
}) => {
  const c = type === 'error'
    ? { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#fca5a5' }
    : { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#6ee7b7' };
  return (
    <div className="animate-scale-in" style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <p style={{ margin: 0, fontSize: 13, color: c.text }}>{message}</p>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: c.text, cursor: 'pointer', padding: 4, lineHeight: 1,
        }}>✕</button>
      )}
    </div>
  );
};

/* ── PageHeader ────────────────────────────────────────────────────────────── */

export const PageHeader: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
}> = ({ title, subtitle, icon: Icon, iconColor }) => (
  <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: `${iconColor}18`,
      border: `1px solid ${iconColor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={22} color={iconColor} strokeWidth={1.7} />
    </div>
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#f1f5f9' }}>{title}</h1>
      <p style={{ margin: 0, fontSize: 13, color: '#8b95a7', marginTop: 2 }}>{subtitle}</p>
    </div>
  </div>
);

/* ── EmptyState ────────────────────────────────────────────────────────────── */

export const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  body: string;
  iconColor?: string;
}> = ({ icon: Icon, title, body, iconColor = '#8b95a7' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', gap: 12,
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: 'rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={24} color={iconColor} strokeWidth={1.5} />
    </div>
    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#f1f5f9' }}>{title}</p>
    <p style={{ margin: 0, fontSize: 13, color: '#8b95a7', textAlign: 'center', maxWidth: 260 }}>{body}</p>
  </div>
);

/* ── Skeleton loader ───────────────────────────────────────────────────────── */

export const SkeletonLoader: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 8 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 96, borderRadius: 16 }} />
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div className="skeleton" style={{ height: 280, borderRadius: 16 }} />
      <div className="skeleton" style={{ height: 280, borderRadius: 16 }} />
    </div>
  </div>
);