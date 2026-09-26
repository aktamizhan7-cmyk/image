import fs from 'fs';
import path from 'path';
import {
  ContactInquiry,
  ContactPriority,
  ContactSubmissionPayload,
  ContactTopicInfo,
  TicketStatus,
} from '../types/contact.js';
import { TEMP_BASE_DIR, CONTACT_TICKETS_FILE, ensureTempDirectories } from '../utils/tempPaths.js';

ensureTempDirectories();
const storageDir = TEMP_BASE_DIR;
const storageFile = CONTACT_TICKETS_FILE;

const TOPICS_CATALOG: ContactTopicInfo[] = [
  {
    id: 'enterprise',
    label: 'Enterprise Node & GPU Cluster',
    description: 'Dedicated GPU instances, multi-node Vulkan clustering, custom high-throughput batch pipelines',
    defaultSlaHours: 2,
    team: 'Infrastructure & GPU Engineering',
  },
  {
    id: 'melanin-tuning',
    label: 'Custom Melanin Dataset Fine-Tuning',
    description: 'Fitzpatrick scale calibration, proprietary studio LUT creation, anti-whitewash neural model fine-tuning',
    defaultSlaHours: 4,
    team: 'Color Science & Neural Research',
  },
  {
    id: 'api-integration',
    label: 'REST / Batch CLI Integration',
    description: 'Headless Docker execution, webhook callbacks, Python/Node SDK bindings',
    defaultSlaHours: 6,
    team: 'Platform & SDK Integration',
  },
  {
    id: 'billing',
    label: 'Pro License & Billing',
    description: 'Seat provisioning, perpetual enterprise licenses, custom purchase orders and invoices',
    defaultSlaHours: 8,
    team: 'Commercial & Accounts',
  },
  {
    id: 'bug-support',
    label: 'Technical Support & Feedback',
    description: 'Bug reports, memory buffer optimization, WebAssembly/Vulkan driver diagnosis',
    defaultSlaHours: 12,
    team: 'Customer Engineering',
  },
  {
    id: 'general',
    label: 'General Inquiries',
    description: 'Partnerships, press, academic licensing, research inquiries',
    defaultSlaHours: 24,
    team: 'General Operations',
  },
];

export class ContactService {
  private static tickets: Map<string, ContactInquiry> = new Map();
  private static isInitialized = false;

  private static initStorage(): void {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      if (fs.existsSync(storageFile)) {
        const raw = fs.readFileSync(storageFile, 'utf-8');
        const list: ContactInquiry[] = JSON.parse(raw);
        list.forEach((t) => this.tickets.set(t.id, t));
      }
    } catch (err) {
      console.warn('[ContactService] Could not load persisted tickets, initializing fresh in-memory:', err);
    }
    this.isInitialized = true;
  }

  private static persistTickets(): void {
    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      const list = Array.from(this.tickets.values());
      fs.writeFileSync(storageFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ContactService] Failed to persist tickets to disk:', err);
    }
  }

  /**
   * Generates human-friendly ticket ID: e.g. LMN-2026-7842
   */
  public static generateTicketId(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `LMN-${year}-${randomHex}${randomNum}`;
  }

  /**
   * Determine assigned team & SLA response time
   */
  public static resolveSLA(topic: string, priority: ContactPriority = 'normal'): {
    hours: number;
    team: string;
    targetDate: string;
  } {
    const matched = TOPICS_CATALOG.find((t) => t.id === topic) || TOPICS_CATALOG[5];
    let hours = matched.defaultSlaHours;

    if (priority === 'urgent') {
      hours = Math.max(1, Math.min(2, hours));
    } else if (priority === 'high') {
      hours = Math.max(2, Math.floor(hours / 2));
    }

    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    return {
      hours,
      team: matched.team,
      targetDate: target.toISOString(),
    };
  }

  /**
   * Creates a new support/contact ticket
   */
  public static async createInquiry(
    payload: ContactSubmissionPayload,
    file?: Express.Multer.File,
    meta?: { clientIp?: string; userAgent?: string }
  ): Promise<ContactInquiry> {
    this.initStorage();

    const priority: ContactPriority = payload.priority || 'normal';
    const sla = this.resolveSLA(payload.topic, priority);
    const ticketId = this.generateTicketId();

    const inquiry: ContactInquiry = {
      id: ticketId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      organization: payload.organization?.trim() || undefined,
      priority,
      topic: payload.topic,
      message: payload.message.trim(),
      status: 'received',
      createdAt: new Date().toISOString(),
      slaResponseHours: sla.hours,
      estimatedResolutionTime: sla.targetDate,
      assignedTeam: sla.team,
      clientIp: meta?.clientIp,
      userAgent: meta?.userAgent,
    };

    if (file) {
      inquiry.attachment = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        filename: file.filename,
        path: file.path,
      };
    }

    this.tickets.set(ticketId, inquiry);
    this.persistTickets();

    // Log ticket dispatch
    console.log(
      `[ContactBackend] New Ticket Created: ${ticketId} | Topic: ${inquiry.topic} | Priority: ${inquiry.priority.toUpperCase()} | SLA: ${sla.hours}h | Email: ${inquiry.email}`
    );

    return inquiry;
  }

  /**
   * Look up a ticket by ID
   */
  public static getTicketById(ticketId: string): ContactInquiry | null {
    this.initStorage();
    const cleanId = ticketId.trim().toUpperCase();
    return this.tickets.get(cleanId) || null;
  }

  /**
   * List recent tickets
   */
  public static listTickets(limit = 20, topic?: string): ContactInquiry[] {
    this.initStorage();
    let all = Array.from(this.tickets.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (topic) {
      all = all.filter((t) => t.topic === topic);
    }

    return all.slice(0, limit);
  }

  /**
   * Update status of an existing ticket
   */
  public static updateStatus(ticketId: string, status: TicketStatus): ContactInquiry | null {
    this.initStorage();
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    ticket.status = status;
    this.tickets.set(ticket.id, ticket);
    this.persistTickets();
    return ticket;
  }

  /**
   * Returns catalog of topics and live support metrics
   */
  public static getCatalog(): {
    topics: ContactTopicInfo[];
    teamStatus: {
      isOnline: boolean;
      activeEngineers: number;
      averageResponseMinutes: number;
      officialSupportEmail: string;
      officeHoursUtc: string;
    };
  } {
    return {
      topics: TOPICS_CATALOG,
      teamStatus: {
        isOnline: true,
        activeEngineers: 8,
        averageResponseMinutes: 18,
        officialSupportEmail: 'support@luminaenhance.ai',
        officeHoursUtc: '24/7 Global On-Call for Enterprise Node / 08:00 - 20:00 UTC Standard',
      },
    };
  }
}
