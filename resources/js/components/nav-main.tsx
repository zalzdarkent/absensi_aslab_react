import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface NavGroupItem extends NavItem {
    children?: NavItem[];
}

interface NavMainProps {
    groups: { label: string; items: NavGroupItem[] }[];
}

export function NavMain({ groups = [] }: NavMainProps) {
    const page = usePage();
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

    // Check if any child is active for a parent menu
    const hasActiveChild = (item: NavGroupItem) => {
        if (!item.children) return false;
        return item.children.some(child => {
            const url = typeof child.href === 'string' ? child.href : child.href.url;
            return page.url === url;
        });
    };

    // Check if menu should be expanded (either manually expanded or has active child)
    const isMenuExpanded = (menuTitle: string, item: NavGroupItem) => {
        return expandedMenus.has(menuTitle) || hasActiveChild(item);
    };

    const toggleMenu = (menuTitle: string) => {
        setExpandedMenus(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(menuTitle)) {
                newExpanded.delete(menuTitle);
            } else {
                newExpanded.add(menuTitle);
            }
            return newExpanded;
        });
    };

    const isActive = (href: string | { url: string }) => {
        const url = typeof href === 'string' ? href : href.url;
        return page.url === url;
    };

    return (
        <div className="px-2 py-0">
            {groups.map((group) => (
                <SidebarGroup key={group.label}>
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                {item.children ? (
                                    <>
                                        <SidebarMenuButton
                                            onClick={() => toggleMenu(item.title)}
                                            tooltip={{ children: item.title }}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight
                                                className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                                    isMenuExpanded(item.title, item) ? 'rotate-90' : ''
                                                }`}
                                            />
                                        </SidebarMenuButton>
                                        {isMenuExpanded(item.title, item) && (
                                            <SidebarMenuSub>
                                                {item.children.map((child) => (
                                                    <SidebarMenuSubItem key={child.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isActive(child.href)}
                                                        >
                                                            <Link href={child.href} prefetch>
                                                                {child.icon && <child.icon />}
                                                                <span>{child.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </>
                                ) : (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
