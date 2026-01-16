// Template types
export interface Template {
  id: string;
  category: 'SocialPost' | 'MarketingCopy' | 'BlogArticle' | 'ProductDescription';
  name: string;
  description?: string;
  inputsSchemaJson?: string;
  promptTemplate: string;
  creditCost: number;
  isActive: boolean;
  createdAt: string;
}

export interface TemplateInputSchema {
  fields: TemplateField[];
}

export interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

// Content types
export interface ContentItem {
  id: string;
  projectId: string;
  templateId?: string;
  contentText: string;
  inputsJson?: string;
  status: 'Draft' | 'Final' | 'Published' | 'Archived';
  creditsConsumed: number;
  createdAt: string;
  updatedAt?: string;
}

export interface GenerateContentRequest {
  projectId: string;
  templateId: string;
  inputs: Record<string, string | string[]>;
}

export interface GenerateContentResponse {
  contentId: string;
  contentText: string;
  creditsConsumed: number;
}

// Credit types
export interface CreditBalance {
  id: string;
  userId: string;
  creditsAllocated: number;
  creditsUsed: number;
  creditsRemaining: number;
  periodStart: string;
  periodEnd: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'Allocation' | 'Generation' | 'Refund' | 'Adjustment';
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}
