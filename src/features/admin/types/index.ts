// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
  contentGenerated: number;
  postsPublished: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole = 'User' | 'Admin';
export type UserStatus = 'Active' | 'Suspended' | 'Deleted';

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  subscription?: {
    planId?: string;
    planName?: string;
    status?: string;
    expiresAt?: string;
  };
  credits?: {
    allocated: number;
    used: number;
    available: number;
  };
}

export interface AdminUserQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export interface AdminCreditUser {
  userId: string;
  email: string;
  fullName?: string;
  allocated: number;
  used: number;
  available: number;
  planName?: string;
  lastTransactionAt?: string;
}

export interface AdminCreditQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  lowBalance?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreditAdjustmentRequest {
  amount: number;
  type: 'Adjustment' | 'Refund';
  reason: string;
}

export interface CreditAdjustmentResponse {
  transactionId: string;
  userId: string;
  amount: number;
  newBalance: number;
  message: string;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export interface AdminPlan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly?: number;
  creditsMonthly: number;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  featureKey: string;
  featureValue: string;
  displayName: string;
  description?: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface CreatePlanRequest {
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly?: number;
  creditsMonthly: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePlanRequest {
  name?: string;
  priceMonthly?: number;
  priceYearly?: number;
  creditsMonthly?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface AddFeatureRequest {
  featureKey: string;
  featureValue: string;
  displayName: string;
  description?: string;
  isVisible?: boolean;
  sortOrder?: number;
}
