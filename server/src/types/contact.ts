export type ContactPriority = 'normal' | 'high' | 'urgent';

export type TicketStatus = 'received' | 'in_review' | 'assigned' | 'resolved';

export interface ContactAttachment {
  originalName: string;
  mimeType: string;
  size: number;
  filename: string;
  path: string;
}

export interface ContactInquiry {
  id: string; // e.g. LMN-2026-X9B21A
  name: string;
  email: string;
  organization?: string;
  priority: ContactPriority;
  topic: string;
  message: string;
  attachment?: ContactAttachment;
  status: TicketStatus;
  createdAt: string;
  slaResponseHours: number;
  estimatedResolutionTime: string;
  assignedTeam: string;
  clientIp?: string;
  userAgent?: string;
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  organization?: string;
  priority?: ContactPriority;
  topic: string;
  message: string;
}

export interface ContactTopicInfo {
  id: string;
  label: string;
  description: string;
  defaultSlaHours: number;
  team: string;
}
