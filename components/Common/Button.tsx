interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition flex items-center justify-center space-x-2';

  const variants = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    danger: 'text-white',
  };

  const variantStyles = {
    primary: { backgroundColor: 'var(--color-primary-600)', '--hover-bg': 'var(--color-primary-700)' } as React.CSSProperties,
    secondary: { backgroundColor: '#e5e7eb', '--hover-bg': '#d1d5db' } as React.CSSProperties,
    danger: { backgroundColor: 'var(--color-error)', '--hover-bg': 'var(--color-error)' } as React.CSSProperties,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`}
      style={variantStyles[variant]}
      {...props}
    >
      {loading && <span className="animate-spin">⏳</span>}
      <span>{children}</span>
    </button>
  );
}
