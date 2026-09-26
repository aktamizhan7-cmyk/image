import { Request, Response } from 'express';
import { z } from 'zod';
import { ContactService } from '../services/contactService.js';
import { ContactPriority } from '../types/contact.js';

const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name must not exceed 100 characters.' }),
  email: z.string().email({ message: 'A valid email address is required.' }),
  organization: z.string().max(120).optional(),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  topic: z.string().min(2, { message: 'Please select a valid topic.' }),
  message: z
    .string()
    .min(5, { message: 'Message must be at least 5 characters.' })
    .max(5000, { message: 'Message cannot exceed 5000 characters.' }),
});

export class ContactController {
  /**
   * POST /api/contact
   * Submit an inquiry or ticket with optional file attachment
   */
  public static async submit(req: Request, res: Response) {
    try {
      // Body may arrive via JSON or multipart/form-data
      const rawData = {
        name: req.body.name,
        email: req.body.email,
        organization: req.body.organization || undefined,
        priority: req.body.priority || 'normal',
        topic: req.body.topic || 'general',
        message: req.body.message,
      };

      const parseResult = contactSchema.safeParse(rawData);
      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map((e) => e.message);
        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages.join('; '),
          validationErrors: parseResult.error.flatten().fieldErrors,
        });
      }

      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] as string;

      const ticket = await ContactService.createInquiry(
        {
          name: parseResult.data.name,
          email: parseResult.data.email,
          organization: parseResult.data.organization,
          priority: parseResult.data.priority as ContactPriority,
          topic: parseResult.data.topic,
          message: parseResult.data.message,
        },
        req.file,
        { clientIp, userAgent }
      );

      return res.status(201).json({
        success: true,
        message: 'Your inquiry has been registered and dispatched to our engineering team.',
        ticket: {
          id: ticket.id,
          name: ticket.name,
          email: ticket.email,
          topic: ticket.topic,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          slaResponseHours: ticket.slaResponseHours,
          estimatedResolutionTime: ticket.estimatedResolutionTime,
          assignedTeam: ticket.assignedTeam,
          hasAttachment: !!ticket.attachment,
          attachmentName: ticket.attachment?.originalName,
        },
      });
    } catch (err: any) {
      console.error('[ContactController] submit error:', err);
      return res.status(500).json({
        error: 'Failed to process inquiry submission.',
        details: err.message,
      });
    }
  }

  /**
   * GET /api/contact/tickets/:ticketId
   * Lookup ticket status
   */
  public static async getTicket(req: Request, res: Response) {
    try {
      const ticketId = req.params.ticketId;
      if (!ticketId) {
        return res.status(400).json({ error: 'Ticket ID is required' });
      }

      const ticket = ContactService.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found',
          message: `No active inquiry found with reference ID "${ticketId}". Please double check your ticket code.`,
        });
      }

      return res.json({
        ticket: {
          id: ticket.id,
          topic: ticket.topic,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          slaResponseHours: ticket.slaResponseHours,
          estimatedResolutionTime: ticket.estimatedResolutionTime,
          assignedTeam: ticket.assignedTeam,
          hasAttachment: !!ticket.attachment,
        },
      });
    } catch (err: any) {
      console.error('[ContactController] getTicket error:', err);
      return res.status(500).json({
        error: 'Failed to lookup ticket status.',
        details: err.message,
      });
    }
  }

  /**
   * GET /api/contact/topics
   * Returns topics, SLAs, and active support channel metadata
   */
  public static async getTopics(_req: Request, res: Response) {
    try {
      const catalog = ContactService.getCatalog();
      return res.json(catalog);
    } catch (err: any) {
      console.error('[ContactController] getTopics error:', err);
      return res.status(500).json({
        error: 'Failed to retrieve topics catalog.',
        details: err.message,
      });
    }
  }

  /**
   * GET /api/contact/tickets
   * Admin/Internal listing of recent tickets
   */
  public static async listRecent(req: Request, res: Response) {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const topic = req.query.topic as string | undefined;
      const tickets = ContactService.listTickets(limit, topic);
      return res.json({
        total: tickets.length,
        tickets: tickets.map((t) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          organization: t.organization,
          topic: t.topic,
          priority: t.priority,
          status: t.status,
          createdAt: t.createdAt,
          slaResponseHours: t.slaResponseHours,
          assignedTeam: t.assignedTeam,
          hasAttachment: !!t.attachment,
        })),
      });
    } catch (err: any) {
      console.error('[ContactController] listRecent error:', err);
      return res.status(500).json({
        error: 'Failed to retrieve tickets.',
        details: err.message,
      });
    }
  }
}
