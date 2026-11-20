import React from 'react';
import { Link } from 'react-router-dom';

export function AcademyCard({
  children,
  className = '',
  soft = false,
}: {
  children: React.ReactNode;
  className?: string;
  soft?: boolean;
}) {
  return (
    <div
      className={`${
        soft
          ? 'bg-[#EEF5F7] border-[#D8E1E8]'
          : 'bg-white border-[#D8E1E8] shadow-[0_4px_18px_rgba(30,41,59,0.06)]'
      } rounded-[18px] border p-6 text-[#1E293B] ${className}`}
    >
      {children}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'honey' | 'sage' | 'lapis' | 'ghost';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2B6CB0] text-white hover:bg-[#215793] border border-transparent shadow-sm',
  secondary:
    'bg-white text-[#1E293B] hover:bg-[#EEF5F7] border border-[#94A3B8]',
  honey:
    'bg-[#E69F3E] text-[#1E293B] hover:bg-[#d8912f] border border-transparent font-bold',
  sage:
    'bg-[#2F855A] text-white hover:bg-[#256d49] border border-transparent',
  lapis:
    'bg-[#0C182E] text-[#F7F1E1] hover:bg-[#162B4D] border border-[#D8AE66]/70',
  ghost:
    'bg-transparent text-[#526071] hover:bg-[#EEF5F7] hover:text-[#1E293B] border border-transparent',
};

export function PillButton({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PillLink({
  children,
  to,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  to: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${BUTTON_STYLES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2B6CB0]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1E293B] sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-[#526071] sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
