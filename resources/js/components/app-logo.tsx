import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <>
            <div className="flex items-center">
                <div className={`flex aspect-square items-center justify-center ${isCollapsed ? 'w-full' : 'size-10'}`}>
                    <img src="/img/logo_aslab.png" alt="Aslab Logo" className="h-full w-full object-contain transition-all duration-200" />
                </div>

                {!isCollapsed && (
                    <div className="ml-2 grid flex-1 text-left text-sm">
                        <span className="mb-0.5 truncate leading-tight font-semibold">Aslab Management</span>
                    </div>
                )}
            </div>
        </>
    );
}
