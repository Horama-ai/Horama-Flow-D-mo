import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = '',
  fullHeight = false
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-slate-200 p-5 ${fullHeight ? 'h-full' : ''} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
      <div className={fullHeight ? 'h-[calc(100%-3rem)]' : ''}>
        {children}
      </div>
    </motion.div>
  );
}

interface InfoCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'highlight' | 'warning' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'bg-white border-slate-200',
  highlight: 'bg-sky-50 border-sky-200',
  warning: 'bg-amber-50 border-amber-200',
  success: 'bg-emerald-50 border-emerald-200'
};

export function InfoCard({
  title,
  children,
  icon,
  variant = 'default',
  className = ''
}: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-5 ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
          <div className="text-sm text-slate-600 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatListProps {
  items: Array<{
    label: string;
    value: string | number;
    unit?: string;
    highlight?: boolean;
  }>;
  className?: string;
}

export function StatList({ items, className = '' }: StatListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`flex items-center justify-between py-2 ${
            index !== items.length - 1 ? 'border-b border-slate-100' : ''
          }`}
        >
          <span className="text-sm text-slate-600">{item.label}</span>
          <span className={`font-semibold ${item.highlight ? 'text-sky-600' : 'text-slate-900'}`}>
            {item.value}
            {item.unit && <span className="text-slate-500 font-normal ml-1">{item.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
