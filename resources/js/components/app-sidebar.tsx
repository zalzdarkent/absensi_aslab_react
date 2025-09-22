import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, History, ScanLine, CalendarDaysIcon } from 'lucide-react';
import AppLogo from './app-logo';

interface NavGroupItem extends NavItem {
    children?: NavItem[];
}

const navGroups: { label: string; items: NavGroupItem[] }[] = [
    {
        label: 'General',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        label: 'Management',
        items: [
            {
                title: 'Data Aslab',
                href: '/aslabs',
                icon: Users,
            },
        ],
    },
    {
        label: 'Attendance',
        items: [
            {
                title: 'Absensi Piket',
                href: '#',
                icon: ScanLine,
                children: [
                    {
                        title: 'Scan Absensi',
                        href: '/attendance-scan',
                        icon: ScanLine,
                    },
                    {
                        title: 'Riwayat Absensi',
                        href: '/attendance-history',
                        icon: History,
                    },
                    {
                        title: 'Jadwal Piket',
                        href: '/jadwal-piket',
                        icon: CalendarDaysIcon,
                    },
                ],
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
