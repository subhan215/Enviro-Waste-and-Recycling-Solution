export function Card({ children, className = '', hover = true }) {
  const baseStyles = 'bg-white rounded-xl border border-border p-6';
  const hoverStyles = hover ? 'shadow-card transition-shadow duration-200 hover:shadow-card-hover' : 'shadow-card';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold text-text-primary ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm text-text-secondary mt-1 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-4 border-t border-border ${className}`}>{children}</div>;
}

// Stat Card for dashboards
export function StatCard({ title, value, icon, trend, className = '' }) {
  return (
    <Card className={`${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-success' : 'text-error'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-custom-green-light rounded-lg text-custom-green">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
      