<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\PeminjamanAset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get peminjaman from last 3 days OR pending status (regardless of date)
        $threeDaysAgo = now()->subDays(3);
        
        $peminjamanQuery = PeminjamanAset::with(['asetAslab', 'bahan', 'user', 'approvedBy'])
            ->where(function($query) use ($threeDaysAgo) {
                $query->where('created_at', '>=', $threeDaysAgo)  // 3 hari terakhir
                      ->orWhere('status', 'pending');             // ATAU yang masih pending
            })
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")  // Pending di atas
            ->orderBy('created_at', 'desc');
        
        // Filter based on user role
        if (in_array($user->role, ['admin', 'aslab'])) {
            // Admin/aslab see all peminjaman
            $peminjamanList = $peminjamanQuery->get();
        } else {
            // Regular users only see their own peminjaman
            $peminjamanList = $peminjamanQuery->where('user_id', $user->id)->get();
        }
        
        $notifications = collect();
        
        foreach ($peminjamanList as $peminjaman) {
            $itemName = $peminjaman->asetAslab->nama_aset ?? $peminjaman->bahan->nama ?? 'Item';
            
            if (in_array($user->role, ['admin', 'aslab'])) {
                // For admin/aslab, show loan requests (focus on pending ones)
                $isUnread = $peminjaman->status === 'pending';
                $type = 'peminjaman_created';
                $title = 'Permintaan Peminjaman';
                $message = $peminjaman->user->name . ' mengajukan peminjaman ' . $itemName;
                
                if ($peminjaman->status === 'approved') {
                    $title = 'Peminjaman Disetujui';
                    $message = 'Peminjaman ' . $itemName . ' oleh ' . $peminjaman->user->name . ' telah disetujui';
                    $type = 'peminjaman_approved';
                } elseif ($peminjaman->status === 'rejected') {
                    $title = 'Peminjaman Ditolak';
                    $message = 'Peminjaman ' . $itemName . ' oleh ' . $peminjaman->user->name . ' telah ditolak';
                    $type = 'peminjaman_rejected';
                }
                
            } else {
                // For regular users, show status updates of their requests
                $isUnread = false;
                $type = 'peminjaman_created';
                $title = 'Peminjaman Diajukan';
                $message = 'Anda mengajukan peminjaman ' . $itemName;
                
                if ($peminjaman->status === 'approved') {
                    $title = 'Peminjaman Disetujui';
                    $message = 'Peminjaman Anda untuk ' . $itemName . ' telah disetujui';
                    $type = 'peminjaman_approved';
                    $isUnread = true; // User should be notified when their request is approved
                } elseif ($peminjaman->status === 'rejected') {
                    $title = 'Peminjaman Ditolak';
                    $message = 'Peminjaman Anda untuk ' . $itemName . ' telah ditolak';
                    $type = 'peminjaman_rejected';
                    $isUnread = true; // User should be notified when their request is rejected
                }
            }
            
            $notifications->push([
                'id' => 'peminjaman_' . $peminjaman->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'time' => $peminjaman->created_at->diffForHumans(),
                'isRead' => !$isUnread,
                'data' => [
                    'peminjaman_id' => $peminjaman->id,
                    'item_name' => $itemName,
                    'user_name' => $peminjaman->user->name,
                    'status' => $peminjaman->status
                ],
                'url' => "/peminjaman-barang?highlight={$peminjaman->id}"
            ]);
        }
        
        // Calculate unread count: Only pending status
        $unreadCount = $peminjamanList->where('status', 'pending')->count();
        
        // Sort notifications: unread first (pending for admin, approved/rejected for users)
        $sortedNotifications = $notifications->sortBy(function ($notification) {
            return $notification['isRead'] ? 1 : 0;
        })->values();

        return response()->json([
            'notifications' => $sortedNotifications,
            'unreadCount' => $unreadCount
        ]);
    }

    public function markAsRead($id)
    {
        // Extract peminjaman ID from notification ID
        if (strpos($id, 'peminjaman_') === 0) {
            // For now, we'll just return success since we're using peminjaman data directly
            // In a full implementation, you might want to create a pivot table 
            // for user_notification_read_status
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'Invalid notification ID']);
    }

    public function markAllAsRead()
    {
        // For now, just return success since we're using peminjaman data directly
        // In a full implementation, you might want to mark all notifications as read
        // for the current user
        return response()->json(['success' => true]);
    }

    private function getNotificationUrl($notification)
    {
        switch ($notification->type) {
            case 'peminjaman_created':
            case 'peminjaman_approved':
            case 'peminjaman_rejected':
                return "/peminjaman-aset?highlight={$notification->related_model_id}";
            default:
                return '/dashboard';
        }
    }

    // Helper method to create notifications when peminjaman status changes
    public static function createPeminjamanNotification($peminjaman, $type)
    {
        $messages = [
            'peminjaman_created' => 'Permintaan peminjaman baru telah dibuat',
            'peminjaman_approved' => 'Permintaan peminjaman Anda telah disetujui',
            'peminjaman_rejected' => 'Permintaan peminjaman Anda telah ditolak'
        ];

        $titles = [
            'peminjaman_created' => 'Permintaan Peminjaman Baru',
            'peminjaman_approved' => 'Peminjaman Disetujui',
            'peminjaman_rejected' => 'Peminjaman Ditolak'
        ];

        // Tentukan siapa yang akan menerima notifikasi
        $targetUsers = [];
        
        if ($type === 'peminjaman_created') {
            // Kirim ke admin/aslab
            $targetUsers = \App\Models\User::whereIn('role', ['admin', 'aslab'])->get();
        } else {
            // Kirim ke peminjam
            $targetUsers = [$peminjaman->user];
        }

        foreach ($targetUsers as $user) {
            Notification::createNotification(
                $user->id,
                $type,
                $titles[$type],
                $messages[$type],
                [
                    'peminjaman_id' => $peminjaman->id,
                    'item_name' => $peminjaman->asetAslab->nama_aset ?? $peminjaman->bahan->nama ?? 'Item',
                    'user_name' => $peminjaman->user->name
                ],
                $peminjaman
            );
        }
    }
}