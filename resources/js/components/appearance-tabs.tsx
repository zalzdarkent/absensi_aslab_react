import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function AppearanceToggleTab() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:block">Tampilan:</span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Tampilan">
                        <Monitor className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => updateAppearance('light')}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span className="flex-1">Light</span>
                        {appearance === 'light' && <Check className="ml-2 h-4 w-4 text-green-500" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => updateAppearance('dark')}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span className="flex-1">Dark</span>
                        {appearance === 'dark' && <Check className="ml-2 h-4 w-4 text-green-500" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => updateAppearance('system')}>
                        <Monitor className="mr-2 h-4 w-4" />
                        <span className="flex-1">System</span>
                        {appearance === 'system' && <Check className="ml-2 h-4 w-4 text-green-500" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
