import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleDarkMode}
      className="w-9 h-9 p-0"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
};

export default DarkModeToggle;