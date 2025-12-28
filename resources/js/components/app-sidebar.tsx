import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, History, ScanLine, CalendarDaysIcon, ClipboardList, PackageIcon, UserSquare2, BookOpen, GraduationCap, School, ClipboardCheck, Shield } from 'lucide-react';
import AppLogo from './app-logo';

interface NavGroupItem extends NavItem {
    children?: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    // Define navigation groups based on user roles and permissions
    const getNavGroups = (): { label: string; items: NavGroupItem[] }[] => {
        const groups = [];
        const permissions = user.permissions || [];

        // Helper to check permission
        const can = (permission: string) => permissions.includes(permission) || user.role === 'admin';

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

        // Attendance
        if (can('view_attendance') || can('view_picket_schedule')) {
            const attendanceChildren = [];

            if (can('view_attendance_history')) {
                attendanceChildren.push({
                    title: 'Riwayat Absensi',
                    href: '/attendance-history',
                    icon: History,
                });
            }

            if (can('view_picket_schedule')) {
                attendanceChildren.push({
                    title: 'Jadwal Piket',
                    href: '/jadwal-piket',
                    icon: CalendarDaysIcon,
                });
            }

            // Add manual attendance option only for those who can manage it (usually admin)
            if (can('manage_attendance')) {
                attendanceChildren.unshift({
                    title: 'Absen Piket',
                    href: '/absen-piket',
                    icon: ScanLine,
                });
            }

            const attendanceItems = [];

            if (attendanceChildren.length > 0) {
                attendanceItems.push({
                    title: 'Absensi Piket',
                    href: '#',
                    icon: ScanLine,
                    children: attendanceChildren,
                });
            }

            // Practical Attendance
            if (can('view_attendance')) { // Assuming generic view_attendance covers this for now, or add specific perm
                attendanceItems.push({
                    title: 'Absensi Praktikum',
                    href: '#',
                    icon: GraduationCap,
                    children: [
                        {
                            title: 'Kelas',
                            href: '/absensi-praktikum/kelas',
                            icon: School,
                        },
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
                            title: 'Absen',
                            href: '/absensi-praktikum/absensi',
                            icon: ClipboardCheck,
                        },
                    ],
                });
            }

            if (attendanceItems.length > 0) {
                groups.push({
                    label: 'Attendance',
                    items: attendanceItems,
                });
            }
        }

        // Management - different access levels
        const managementItems = [];

        // Pendataan Aset Aslab
        if (can('view_assets')) {
            managementItems.push({
                title: 'Data Aset & Bahan',
                href: '/aset-aslab',
                icon: ClipboardList,
            });
        }

        // Peminjaman Barang - All users can typically view loans, but maybe filtered
        if (can('view_loans')) {
            managementItems.push({
                title: 'Peminjaman Barang',
                href: '/peminjaman-barang',
                icon: PackageIcon,
            });
        }

        // Add Management group if there are any items
        if (managementItems.length > 0) {
            groups.push({
                label: 'Management',
                items: managementItems,
            });
        }

        // Administration
        const adminItems = [];

        if (can('view_users')) {
            adminItems.push({
                title: 'Data Aslab',
                href: '/aslabs',
                icon: Users,
            });
        }

        if (can('manage_users') || can('view_users')) { // Assuming manage_users implies access to user management
            adminItems.push({
                title: 'Kelola User',
                href: '/kelola-user',
                icon: UserSquare2,
            });
        }

        if (can('manage_roles')) {
            adminItems.push({
                title: 'Role Management',
                href: '/roles',
                icon: Shield,
            });
        }

        if (adminItems.length > 0) {
            groups.push({
                label: 'Administration',
                items: adminItems,
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
