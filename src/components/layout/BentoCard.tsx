import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BentoCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  to?: string;
  disabled?: boolean;
  disabledLabel?: string;
  liveData?: string;
  liveDataLoading?: boolean;
  variant?: 'default' | 'success' | 'primary' | 'warning';
  size?: 'default' | 'large';
}

const variantStyles = {
  default: 'hover:border-primary/50',
  success: 'bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
  primary: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40',
  warning: 'bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/20 text-emerald-500',
  primary: 'bg-primary/20 text-primary',
  warning: 'bg-amber-500/20 text-amber-500',
};

export function BentoCard({ 
  icon, 
  title, 
  subtitle, 
  to, 
  disabled, 
  disabledLabel,
  liveData,
  liveDataLoading,
  variant = 'default',
  size = 'default',
}: BentoCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!disabled && to) {
      navigate(to);
    }
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 cursor-pointer',
        disabled
          ? 'opacity-50 cursor-not-allowed bg-muted/50'
          : cn('hover:shadow-lg hover:-translate-y-1', variantStyles[variant]),
        size === 'large' && 'sm:col-span-2 lg:col-span-1'
      )}
      onClick={handleClick}
    >
      <CardHeader className={cn('pb-3', size === 'large' && 'pb-4')}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2.5 rounded-xl',
            disabled ? 'bg-muted text-muted-foreground' : iconVariantStyles[variant]
          )}>
            {icon}
          </div>
          {disabled && disabledLabel && (
            <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {disabledLabel}
            </span>
          )}
        </div>
        <CardTitle className={cn('mt-4', size === 'large' ? 'text-xl' : 'text-lg')}>
          {title}
        </CardTitle>
        <CardDescription className="text-sm">{subtitle}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Live Data */}
        {(liveData || liveDataLoading) && !disabled && (
          <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border/50">
            {liveDataLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p className="text-sm font-medium">{liveData}</p>
            )}
          </div>
        )}
        
        {!disabled && (
          <Button variant="ghost" size="sm" className="group-hover:text-primary p-0 h-auto">
            Acessar
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
