import { Wallet, Calendar, Heart } from 'lucide-react';
import { GreetingHeader } from '@/components/layout/GreetingHeader';
import { BentoCard } from '@/components/layout/BentoCard';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <GreetingHeader />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BentoCard
          icon={<Wallet className="h-5 w-5" />}
          title="Gestão Financeira"
          subtitle="Controle de gastos e tetos"
          to="/finance"
        />
        <BentoCard
          icon={<Calendar className="h-5 w-5" />}
          title="Agenda & Foco"
          subtitle="Planejamento e Deep Work"
          to="/focus"
        />
        <BentoCard
          icon={<Heart className="h-5 w-5" />}
          title="Hábitos"
          subtitle="Acompanhe sua rotina"
          disabled
          disabledLabel="Em Breve"
        />
      </div>
    </div>
  );
}
