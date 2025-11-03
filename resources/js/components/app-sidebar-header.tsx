import { Breadcrumbs } from '@/components/breadcrumbs';
import RfidModeToggleMini from '@/components/rfid-mode-toggle-mini';
import TelegramSetup from '@/components/telegram-setup';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Radio, BotMessageSquare } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <AppearanceToggleTab />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BotMessageSquare className="h-4 w-4" />
                            <span className="sr-only">Telegram Setup</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-96" align="end">
                        <TelegramSetup />
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Radio className="h-4 w-4" />
                            <span className="sr-only">RFID Mode Toggle</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72" align="end">
                        <RfidModeToggleMini />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
