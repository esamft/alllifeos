import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  to?: string;
  disabled?: boolean;
  disabledLabel?: string;
}

export function BentoCard({ icon, title, subtitle, to, disabled, disabledLabel }: BentoCardProps) {
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
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-lg hover:border-primary/50 hover:-translate-y-1'
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            disabled ? 'bg-muted' : 'bg-primary/10 text-primary'
          )}>
            {icon}
          </div>
          {disabled && disabledLabel && (
            <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {disabledLabel}
            </span>
          )}
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      {!disabled && (
        <CardContent className="pt-0">
          <Button variant="ghost" size="sm" className="group-hover:text-primary p-0 h-auto">
            Acessar
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
