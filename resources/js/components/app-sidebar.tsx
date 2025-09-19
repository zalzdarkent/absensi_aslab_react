import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, History, ScanLine } from 'lucide-react';
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
                    }
                ],
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Github Repo',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
