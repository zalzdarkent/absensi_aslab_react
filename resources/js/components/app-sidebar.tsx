import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, History, ScanLine, CalendarDaysIcon, ClipboardList, PackageIcon, UserSquare2, BookOpen, GraduationCap, School, ClipboardCheck } from 'lucide-react';
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
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
            ],
        });

        // Attendance - only for Admin and Aslab
        if (user.role === 'admin' || user.role === 'aslab') {
            const attendanceChildren = [
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
            ];

            // Add manual attendance option only for admin
            if (user.role === 'admin') {
                attendanceChildren.unshift({
                    title: 'Absen Piket',
                    href: '/absen-piket',
                    icon: ScanLine,
                });
            }

            groups.push({
                label: 'Attendance',
                items: [
                    {
                        title: 'Absensi Piket',
                        href: '#',
                        icon: ScanLine,
                        children: attendanceChildren,
                    },
                    {
                        title: 'Absensi Praktikum',
                        href: '#',
                        icon: GraduationCap,
                        children: [
                            {
                                title: 'Mata Kuliah',
                                href: '/absensi-praktikum/mata-kuliah-praktikum',
                                icon: BookOpen,
                            },
                            {
                                title: 'Dosen',
                                href: '/absensi-praktikum/dosen-praktikum',
                                icon: Users,
                            },
                            {
                                title: 'Kelas',
                                href: '/absensi-praktikum/kelas-praktikum',
                                icon: School,
                            },
                            {
                                title: 'Absen',
                                href: '/absensi-praktikum/absensi',
                                icon: ClipboardCheck,
                            },
                        ],
                    },
                ],
            });
        }

        // Management - different access levels
        const managementItems = [];

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

        // Administration - only for Admin (most sensitive operations)
        if (user.role === 'admin') {
            groups.push({
                label: 'Administration',
                items: [
                    {
                        title: 'Data Aslab',
                        href: '/aslabs',
                        icon: Users,
                    },
                    {
                        title: 'Kelola User',
                        href: '/kelola-user',
                        icon: UserSquare2,
                    },
                ],
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
                            <Link href="/dashboard" prefetch>
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
