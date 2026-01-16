// Template Types - matching backend DTOs

export type TemplateCategory = 'SocialPost' | 'MarketingCopy' | 'BlogArticle' | 'ProductDescription';
export type Platform = 'X' | 'Facebook' | 'Instagram' | 'TikTok';

export interface TemplateInputField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  platform?: Platform;
  promptTemplate: string;
  inputSchema: TemplateInputField[];
  creditCost: number;
  isActive: boolean;
  createdAt: string;
}
