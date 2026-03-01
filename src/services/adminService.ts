import { User, UserRole } from '@/types';
import { apiRequest } from './api';

// Backend DTO for user from admin endpoint
interface ApiUserDto {
    id: string;
    email: string;
    displayName: string;
    role: string;
    createdAt?: string;
    phone?: string;
}

// Backend DTO for broker takeover
interface ApiBrokerTakeoverRequest {
    listingId: string;
    brokerId: string;
}

interface ApiBrokerTakeoverResponse {
    id: string;
    listingId: string;
    brokerId: string;
    status: string;
    createdAt: string;
}

function normalizeRole(role: string): UserRole {
    const r = role.toLowerCase();
    if (r === 'admin') return 'admin';
    if (r === 'seller') return 'user'; // Seller is now merged into user
    if (r === 'broker') return 'broker';
    return 'user';
}

function mapApiUser(dto: ApiUserDto): User {
    return {
        id: dto.id,
        name: dto.displayName || dto.email.split('@')[0],
        email: dto.email,
        password: '',
        role: normalizeRole(dto.role),
        profile: {
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.displayName || dto.email}`,
            phone: dto.phone,
        },
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
        updatedAt: new Date(),
    };
}

// ─── Admin User Management ──────────────────────────────────────────

export async function fetchAllUsers(): Promise<User[]> {
    try {
        const data = await apiRequest<ApiUserDto[]>('/api/admin/users', { auth: true });
        return Array.isArray(data) ? data.map(mapApiUser) : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
        await apiRequest(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: { role },
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error updating user role:', error);
        return false;
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    try {
        await apiRequest(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

// ─── Admin Dashboard Stats ──────────────────────────────────────────

export interface AdminDashboardStats {
    totalListings: number;
    totalUsers: number;
    pendingModeration: number;
    totalRevenue: number;
}

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
    try {
        const data = await apiRequest<AdminDashboardStats>('/api/admin/dashboard', { auth: true });
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { totalListings: 0, totalUsers: 0, pendingModeration: 0, totalRevenue: 0 };
    }
}

// ─── Admin Listing Management ───────────────────────────────────────

export async function fetchAdminListings(): Promise<any[]> {
    try {
        const data = await apiRequest<any[]>('/api/admin/listings', { auth: true });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching admin listings:', error);
        return [];
    }
}

export async function approveListingAdmin(listingId: string): Promise<boolean> {
    try {
        await apiRequest(`/api/admin/listings/${listingId}/approve`, {
            method: 'PUT',
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error approving listing:', error);
        return false;
    }
}

export async function rejectListingAdmin(listingId: string, reason?: string): Promise<boolean> {
    try {
        await apiRequest(`/api/admin/listings/${listingId}/reject`, {
            method: 'PUT',
            body: reason ? { reason } : undefined,
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error rejecting listing:', error);
        return false;
    }
}

// ─── Broker Takeover Service ────────────────────────────────────────

/**
 * SELLER: Gửi yêu cầu ủy quyền cho một Broker cụ thể
 */
export async function sendTakeoverRequest(
    listingId: string,
    brokerId: string
): Promise<ApiBrokerTakeoverResponse | null> {
    try {
        const payload: ApiBrokerTakeoverRequest = { listingId, brokerId };
        const data = await apiRequest<ApiBrokerTakeoverResponse>('/api/brokers/takeover/request', {
            method: 'POST',
            body: payload,
            auth: true,
        });
        return data;
    } catch (error) {
        console.error('Error sending takeover request:', error);
        return null;
    }
}

/**
 * BROKER: Chấp nhận hoặc Từ chối yêu cầu quản lý
 */
export async function respondToTakeoverRequest(
    requestId: string,
    status: 'accepted' | 'rejected'
): Promise<boolean> {
    try {
        await apiRequest(`/api/brokers/takeover/${requestId}`, {
            method: 'PATCH',
            body: { status },
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error responding to takeover request:', error);
        return false;
    }
}

/**
 * HỆ THỐNG: Xác nhận đóng phí và bàn giao quyền quản lý
 */
export async function confirmTakeoverPayment(requestId: string): Promise<boolean> {
    try {
        await apiRequest(`/api/brokers/takeover/${requestId}/confirm`, {
            method: 'POST',
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error confirming takeover payment:', error);
        return false;
    }
}

/**
 * SELLER: Thu hồi quyền quản lý từ Broker
 */
export async function unassignBroker(requestId: string): Promise<boolean> {
    try {
        await apiRequest(`/api/brokers/takeover/${requestId}`, {
            method: 'DELETE',
            auth: true,
        });
        return true;
    } catch (error) {
        console.error('Error unassigning broker:', error);
        return false;
    }
}

/**
 * BROKER: Lấy danh sách yêu cầu takeover cho broker hiện tại
 */
export async function fetchBrokerRequests(): Promise<ApiBrokerTakeoverResponse[]> {
    try {
        const data = await apiRequest<ApiBrokerTakeoverResponse[]>('/api/brokers/takeover/requests', {
            auth: true,
        });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching broker requests:', error);
        return [];
    }
}

/**
 * BROKER: Lấy danh sách listings đang quản lý
 */
export async function fetchManagedListings(): Promise<string[]> {
    try {
        const data = await apiRequest<{ listingIds: string[] }>('/api/brokers/managed-listings', {
            auth: true,
        });
        return data.listingIds || [];
    } catch (error) {
        console.error('Error fetching managed listings:', error);
        return [];
    }
}
