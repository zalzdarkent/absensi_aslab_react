import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";

interface MataKuliahPraktikum {
    id: number;
    nama: string;
    created_at: string;
    updated_at: string;
}

export const createMataKuliahPraktikumColumns = (
    onEdit?: (mataKuliah: MataKuliahPraktikum) => void
): ColumnDef<MataKuliahPraktikum>[] => [
    {
        accessorKey: "nama",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-auto p-0 font-medium"
                >
                    Nama Mata Kuliah
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const nama = row.getValue("nama") as string;
            return <div>{nama}</div>;
        },
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const ActionsCell = () => {
                const mataKuliah = row.original;
                const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

                const handleDelete = () => {
                    setIsDeleteModalOpen(true);
                };

                const confirmDelete = () => {
                    router.delete(`/absensi-praktikum/mata-kuliah-praktikum/${mataKuliah.id}`, {
                        preserveScroll: true,
                    });
                    setIsDeleteModalOpen(false);
                };

                return (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {onEdit ? (
                                    <DropdownMenuItem onClick={() => onEdit(mataKuliah)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/absensi-praktikum/mata-kuliah-praktikum/${mataKuliah.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                                    <DialogDescription>
                                        Apakah Anda yakin ingin menghapus mata kuliah "{mataKuliah.nama}"?
                                        Tindakan ini tidak dapat dibatalkan.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Batal</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={confirmDelete}>
                                        Hapus
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                );
            };

            return <ActionsCell />;
        },
    },
];
