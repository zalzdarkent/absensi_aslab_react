import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Pencil, Trash2, Shield, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: Role[];
}

export default function RoleIndex({ roles }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/roles', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Role created successfully');
            },
            onError: () => {
                toast.error('Failed to create role');
            }
        });
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setData('name', role.name);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;

        put(`/roles/${editingRole.id}`, {
            onSuccess: () => {
                setEditingRole(null);
                reset();
                toast.success('Role updated successfully');
            },
            onError: () => {
                toast.error('Failed to update role');
            }
        });
    };

    const handleDelete = (role: Role) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        router.delete(`/roles/${role.id}`, {
            onSuccess: () => toast.success('Role deleted successfully'),
            onError: () => toast.error('Failed to delete role'),
        });
    };

    const closeEdit = () => {
        setEditingRole(null);
        reset();
        clearErrors();
    };

    const closeCreate = () => {
        setIsCreateOpen(false);
        reset();
        clearErrors();
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Role Management', href: '/roles' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
                        <p className="text-muted-foreground">Manage user roles and access control.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeCreate()}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Role</DialogTitle>
                                <DialogDescription>
                                    Add a new role to the system.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. editor"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeCreate}>Cancel</Button>
                                    <Button type="submit" disabled={processing}>Save Role</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Guard</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No roles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role, index) => (
                                    <TableRow key={role.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-primary" />
                                            {role.name}
                                        </TableCell>
                                        <TableCell>{role.guard_name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>

                                            {/* Protect system roles from deletion in UI as well */}
                                            {!['admin', 'aslab', 'mahasiswa', 'dosen'].includes(role.name) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(role)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Modal */}
                <Dialog open={!!editingRole} onOpenChange={(open) => !open && closeEdit()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                            <DialogDescription>
                                Modify the role name.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Role Name</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. editor"
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeEdit}>Cancel</Button>
                                <Button type="submit" disabled={processing}>Update Role</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
