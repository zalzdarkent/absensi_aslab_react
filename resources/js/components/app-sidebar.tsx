import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, History, ScanLine, CalendarDaysIcon, ClipboardList, PackageIcon } from 'lucide-react';
import AppLogo from './app-logo';

interface NavGroupItem extends NavItem {
    children?: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    // Define navigation groups based on user roles
    const getNavGroups = (): { label: string; items: NavGroupItem[] }[] => {
        const groups = [];

        // General - accessible to all logged-in users
        groups.push({
            label: 'General',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        });

        // Attendance - only for Admin and Aslab
        if (user.role === 'admin' || user.role === 'aslab') {
            groups.push({
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
            });
        }

        // Management - different access levels
        const managementItems = [];

        // Data Aslab - only Admin can access
        if (user.role === 'admin') {
            managementItems.push({
                title: 'Data Aslab',
                href: '/aslabs',
                icon: Users,
            });
        }

        // Pendataan Aset Aslab - Admin and Aslab can access
        if (user.role === 'admin' || user.role === 'aslab') {
            managementItems.push({
                title: 'Pendataan Aset Aslab',
                href: '/aset-aslab',
                icon: ClipboardList,
            });
        }

        // Peminjaman Barang - All users can access
        managementItems.push({
            title: 'Peminjaman Barang',
            href: '/peminjaman-barang',
        icon: PackageIcon,
        });

        // Add Management group if there are any items
        if (managementItems.length > 0) {
            groups.push({
                label: 'Management',
                items: managementItems,
            });
        }

        return groups;
    };

    const navGroups = getNavGroups();
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
