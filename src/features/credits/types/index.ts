// Credits Types - matching backend DTOs

export type TransactionType = 'Allocation' | 'Generation' | 'Refund' | 'Adjustment';

export interface CreditBalance {
  allocated: number;
  used: number;
  available: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  referenceId?: string;
  createdAt: string;
}
