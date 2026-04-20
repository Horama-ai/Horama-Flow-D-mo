import { motion, AnimatePresence } from 'framer-motion';
import { useState, type ReactNode } from 'react';

// ============================================
// PRISM DESIGN SYSTEM
// ============================================

// ============================================
// CARD
// ============================================

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, hover = false, style }: CardProps) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }
  } : {};

  return (
    <Component
      onClick={onClick}
      style={style}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...hoverProps}
    >
      {children}
    </Component>
  );
}

// ============================================
// STAT CARD - PRISM signature component
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  className?: string;
}

export function StatCard({ label, value, subtext, color = 'blue', className = '' }: StatCardProps) {
  const colorStyles = {
    blue: {
      border: 'border-prism-500',
      gradient: 'from-prism-500/5 to-transparent',
      text: 'text-prism-600'
    },
    green: {
      border: 'border-emerald-500',
      gradient: 'from-emerald-500/5 to-transparent',
      text: 'text-emerald-600'
    },
    orange: {
      border: 'border-orange-500',
      gradient: 'from-orange-500/5 to-transparent',
      text: 'text-orange-600'
    },
    purple: {
      border: 'border-violet-500',
      gradient: 'from-violet-500/5 to-transparent',
      text: 'text-violet-600'
    }
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border border-gray-100/80 p-6 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:border-gray-200/80 transition-all duration-300 ${className}`}
    >
      {/* Colored left bar */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${styles.border.replace('border-', 'bg-')}`} />

      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-30`} />

      <div className="relative">
        <div className="text-sm font-medium text-gray-500 tracking-wide uppercase mb-3">{label}</div>
        <div className="text-4xl font-bold text-gray-900 tracking-tight tabular-nums">{value}</div>
        {subtext && <div className={`${styles.text} text-sm font-medium mt-2`}>{subtext}</div>}
      </div>
    </motion.div>
  );
}

// ============================================
// METRIC CARD - For KPIs with charts
// ============================================

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  description?: string;
  trend?: { value: number; direction: 'up' | 'down' | 'stable' };
  status?: 'normal' | 'warning' | 'critical';
  chart?: ReactNode;
  expandable?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  description,
  trend,
  status = 'normal',
  chart,
  expandable = false,
  className = ''
}: MetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    normal: 'border-l-prism-500',
    warning: 'border-l-amber-500',
    critical: 'border-l-red-500'
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={expandable ? { y: -2 } : undefined}
      transition={{ duration: 0.3 }}
      className={`
        bg-white rounded-2xl border border-gray-100 overflow-hidden
        border-l-4 ${statusColors[status]}
        ${expandable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${className}
      `}
      onClick={() => expandable && setIsExpanded(true)}
    >
      <div className="p-6">
        <div className="text-xs font-semibold text-prism-600 uppercase tracking-wide mb-3">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl lg:text-5xl font-extralight text-gray-900 tabular-nums">{value}</span>
          {unit && <span className="text-lg text-gray-400">{unit}</span>}
          {trend && (
            <span className={`text-sm font-medium ml-2 px-2 py-0.5 rounded-full ${
              trend.direction === 'up' ? 'bg-emerald-50 text-emerald-700' :
              trend.direction === 'down' ? 'bg-red-50 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
        {chart && <div className="mt-4 h-16">{chart}</div>}
      </div>
    </motion.div>
  );

  if (!expandable) return content;

  return (
    <>
      {content}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <div className="text-xs font-semibold text-prism-600 uppercase tracking-wide">{label}</div>
                  {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl lg:text-7xl font-extralight text-gray-900 tabular-nums">{value}</span>
                  {unit && <span className="text-2xl text-gray-400">{unit}</span>}
                </div>
                {chart && <div className="h-80">{chart}</div>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// SPARKLINE
// ============================================

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = '#0c7ff2', height = 40 }: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#gradient-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ============================================
// BUTTON
// ============================================

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = ''
}: ButtonProps) {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500 shadow-lg shadow-gray-900/25',
    secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'blue' | 'red' | 'yellow';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    blue: 'bg-prism-50 text-prism-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-amber-50 text-amber-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

// ============================================
// TABS
// ============================================

interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
              activeTab === tab.id ? 'bg-prism-100 text-prism-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="px-4 lg:px-8 py-16 lg:py-24 text-center">
      <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </div>
  );
}

// ============================================
// LOADING SPINNER
// ============================================

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-prism-200 border-t-prism-600 rounded-full"
      />
    </div>
  );
}

// ============================================
// LIVE INDICATOR
// ============================================

export function LiveIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-prism-50 rounded-full ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-prism-500" />
      </span>
      <span className="text-xs font-semibold text-prism-700 uppercase tracking-wide">Live</span>
    </div>
  );
}

// ============================================
// STATUS DOT
// ============================================

interface StatusDotProps {
  status: 'fluide' | 'modéré' | 'dense' | 'saturé';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusDot({ status, size = 'sm', showLabel = false }: StatusDotProps) {
  const colors = {
    'fluide': 'bg-prism-500',
    'modéré': 'bg-prism-400',
    'dense': 'bg-amber-500',
    'saturé': 'bg-red-500'
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full ${colors[status]} ${sizes[size]}`} />
      {showLabel && <span className="text-xs font-medium text-gray-600 capitalize">{status}</span>}
    </div>
  );
}

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'auto' | 'blue' | 'red' | 'yellow' | 'green';
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, size = 'sm', color = 'auto', showLabel = false, className = '' }: ProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);

  const getColor = () => {
    if (color !== 'auto') {
      const colors = {
        blue: 'bg-prism-500',
        red: 'bg-red-500',
        yellow: 'bg-amber-500',
        green: 'bg-emerald-500'
      };
      return colors[color];
    }
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-prism-500';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`${heights[size]} bg-gray-100 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColor()}`}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</span>}
    </div>
  );
}

// ============================================
// ALERT ITEM
// ============================================

interface AlertItemProps {
  message: string;
  severity: 'info' | 'warning' | 'critical';
  zone: string;
  time: string;
  acknowledged: boolean;
  onAcknowledge?: () => void;
}

export function AlertItem({ message, severity, zone, time, acknowledged, onAcknowledge }: AlertItemProps) {
  const severityStyles = {
    info: 'border-l-prism-500 bg-prism-50',
    warning: 'border-l-amber-500 bg-amber-50',
    critical: 'border-l-red-500 bg-red-50'
  };

  const textColors = {
    info: 'text-prism-900',
    warning: 'text-amber-900',
    critical: 'text-red-900'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: acknowledged ? 0.5 : 1, y: 0 }}
      className={`p-4 border-l-4 ${severityStyles[severity]} ${acknowledged ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textColors[severity]}`}>{message}</p>
          <p className="text-xs text-gray-500 mt-1">{zone} • {time}</p>
        </div>
        {!acknowledged && onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-white/50 rounded transition-colors"
          >
            Acquitter
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Re-export
export { Progress as ProgressBar };
