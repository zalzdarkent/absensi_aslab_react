import { Head } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Moon,
    Sun,
    Calendar,
    Clock,
    Users,
    MapPin,
    ChevronLeft,
    Monitor,
    Coffee,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    prodi: string;
    semester: number;
    piket_day: string | null;
    avatar?: string;
}

interface Props {
    user: User;
    colleagues: User[];
}

const dayNames: { [key: string]: string } = {
    senin: 'Senin',
    selasa: 'Selasa',
    rabu: 'Rabu',
    kamis: 'Kamis',
    jumat: 'Jumat',
};

const dayThemes: { [key: string]: { from: string, to: string, icon: string } } = {
    senin: { from: 'from-blue-600', to: 'to-indigo-700', icon: '🌅' },
    selasa: { from: 'from-emerald-500', to: 'to-teal-700', icon: '🌿' },
    rabu: { from: 'from-purple-600', to: 'to-violet-800', icon: '💜' },
    kamis: { from: 'from-orange-500', to: 'to-amber-700', icon: '🧡' },
    jumat: { from: 'from-pink-500', to: 'to-rose-700', icon: '🌸' },
};

export default function StandalonePiket({ user, colleagues }: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    const currentDay = user.piket_day?.toLowerCase() || 'senin';
    const theme = dayThemes[currentDay] || dayThemes.senin;

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-500 overflow-x-hidden">
            <Head title={`Jadwal Piket - ${user.name}`} />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 overflow-hidden -z-10 bg-grid-slate-100/[0.03] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/[0.05]">
                <div className={cn(
                    "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
                    theme.from.replace('from-', 'bg-')
                )} />
                <div className={cn(
                    "absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full blur-[100px] opacity-10 transition-colors duration-1000",
                    theme.to.replace('to-', 'bg-')
                )} />
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/60 border-b border-border/40 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white shadow-lg", theme.from, theme.to)}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-tight text-lg">PiketView</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full w-10 h-10 hover:bg-muted/50 transition-all duration-300 active:scale-90"
                >
                    {appearance === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
            </header>

            <main className="max-w-md mx-auto px-4 py-8 space-y-8 pb-12">
                {/* Hero Section */}
                <section className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500",
                        theme.from, theme.to
                    )} />

                    <Card className="relative border-none overflow-hidden rounded-3xl bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
                        <div className={cn("h-24 w-full bg-gradient-to-r", theme.from, theme.to)} />

                        <CardContent className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-xl scale-110 mb-4 transition-transform hover:rotate-3 duration-500">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="object-cover" />
                                ) : (
                                    <AvatarFallback className={cn("bg-gradient-to-br text-white text-2xl font-bold", theme.from, theme.to)}>
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            <div className="space-y-1">
                                <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
                                <p className="text-muted-foreground font-medium">{user.prodi} • Semester {user.semester}</p>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-muted/50 backdrop-blur flex items-center gap-2 border border-border/50">
                                    <span className="text-lg">{theme.icon}</span>
                                    <span className="font-semibold uppercase tracking-wider">{dayNames[currentDay] || currentDay}</span>
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Colleagues Section */}
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold tracking-tight">Teman Piket Hari Ini</h2>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {colleagues.length} Orang
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {colleagues.length > 0 ? (
                            colleagues.map((colleague, index) => (
                                <div
                                    key={colleague.id}
                                    className="group relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm relative z-10">
                                        <Avatar className="w-12 h-12 border border-border shadow-sm">
                                            {colleague.avatar ? (
                                                <img src={colleague.avatar} alt={colleague.name} className="object-cover" />
                                            ) : (
                                                <AvatarFallback className="bg-muted font-bold text-sm">
                                                    {getInitials(colleague.name)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground truncate">{colleague.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{colleague.prodi}</span>
                                                <span>•</span>
                                                <span>S{colleague.semester}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl bg-muted/20 border-2 border-dashed border-border/50 text-center animate-pulse">
                                <Coffee className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground font-medium">Hanya kamu yang terjadwal hari ini</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer Info */}
                <footer className="text-center pt-8 animate-in fade-in duration-1000">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <span>Tap again tomorrow to refresh</span>
                        <span>•</span>
                        <span>Lab Management System</span>
                    </p>
                </footer>
            </main>
        </div>
    );
}
