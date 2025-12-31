import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onOpenCategories: () => void;
}

export function Header({ onOpenCategories }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Finanças</h1>
          <p className="text-sm text-muted-foreground">Controle Pessoal</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onOpenCategories}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">Gerenciar Categorias</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Alternar Tema</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}