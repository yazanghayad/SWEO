import type React from 'react';

export interface SourceRow {
  id?: string;
  logo: React.ReactNode;
  name: string;
  nameIsLink?: boolean;
  statusText: string;
  actionLabel: string;
  onAction?: () => void;
  onDelete?: () => void;
  hasCheckmark?: boolean;
}

export interface SourceSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: { label: string; variant: 'beta' | 'new' };
  headerAction?: React.ReactNode;
  rows: SourceRow[];
}

export interface ChecklistItem {
  label: string;
  done: boolean;
  linkText?: string;
  onClick?: () => void;
}
