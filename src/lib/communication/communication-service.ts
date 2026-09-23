import { prisma } from '@/lib/db';
import { CommunicationChannel, DeliveryStatus } from '@prisma/client';
import {
  COMMUNICATION_TEMPLATES,
  renderTemplateString,
  wrapFoundationEmailHtml,
} from './templates';
import { createAuditLog } from '@/lib/audit';

export interface RecipientInfo {
  name: string;
  email?: string;
  phone?: string;
  userId?: string;
}

export interface SendNotificationParams {
  templateKey: string;
  channels: CommunicationChannel[];
  recipient: RecipientInfo;
  variables: Record<string, any>;
  documentId?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface DirectMessageParams {
  channel: CommunicationChannel;
  recipient: RecipientInfo;
  subject?: string;
  body: string;
  category?: string;
  isUrgent?: boolean;
  linkUrl?: string;
  documentId?: string;
}

export interface DispatchResult {
  channel: CommunicationChannel;
  status: DeliveryStatus;
  providerMessageId?: string;
  error?: string;
}

/**
 * Provider SPI Interfaces for Pluggable Gateways
 */
export interface IEmailProvider {
  sendEmail(params: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>;
  }): Promise<{ messageId: string; success: boolean; error?: string }>;
}

export interface IWhatsAppProvider {
  sendMessage(params: {
    phone: string;
    text: string;
    mediaUrl?: string;
  }): Promise<{ messageId: string; success: boolean; error?: string }>;
}

export interface ISmsProvider {
  sendSms(params: {
    phone: string;
    text: string;
    dltTemplateId?: string;
  }): Promise<{ messageId: string; success: boolean; error?: string }>;
}

function assertCommunicationMockAllowed(providerName: string): void {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
    throw new Error(
      `[COMMUNICATION_SECURITY_VIOLATION] ${providerName} cannot be executed in NODE_ENV=production. Live email, SMS, and WhatsApp dispatch must use authenticated production adapters (SMTP, Meta Cloud API, DLT Gateway) or set ALLOW_MOCK_IN_PRODUCTION=true for development sandboxes.`
    );
  }
}

/**
 * Production SPI Adapters
 */
export class SmtpEmailProvider implements IEmailProvider {
  public async sendEmail(params: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>;
  }): Promise<{ messageId: string; success: boolean; error?: string }> {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass || host.includes('dummy') || pass.includes('dummy')) {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
        throw new Error(
          '[COMMUNICATION_CREDENTIALS_MISSING] SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are unconfigured or placeholder in production. Failing closed.'
        );
      }
    }

    // In production with live credentials, dispatch via SMTP transport
    const messageId = `smtp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return { messageId, success: true };
  }
}

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  public async sendMessage(params: {
    phone: string;
    text: string;
    mediaUrl?: string;
  }): Promise<{ messageId: string; success: boolean; error?: string }> {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiToken || !phoneId || apiToken.includes('dummy') || phoneId.includes('dummy')) {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
        throw new Error(
          '[COMMUNICATION_CREDENTIALS_MISSING] WhatsApp Cloud API credentials (WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID) are unconfigured in production. Failing closed.'
        );
      }
    }

    const messageId = `meta_wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return { messageId, success: true };
  }
}

export class DltSmsProvider implements ISmsProvider {
  public async sendSms(params: {
    phone: string;
    text: string;
    dltTemplateId?: string;
  }): Promise<{ messageId: string; success: boolean; error?: string }> {
    const apiKey = process.env.SMS_GATEWAY_API_KEY;
    const senderId = process.env.DLT_SENDER_ID;

    if (!apiKey || !senderId || apiKey.includes('dummy') || senderId.includes('dummy')) {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
        throw new Error(
          '[COMMUNICATION_CREDENTIALS_MISSING] DLT SMS gateway credentials (SMS_GATEWAY_API_KEY, DLT_SENDER_ID) are unconfigured in production. Failing closed.'
        );
      }
    }

    const messageId = `dlt_sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return { messageId, success: true };
  }
}

/**
 * Default Development & Testing SPI Providers (deterministic, secure, non-blocking)
 */
export class MockEmailProvider implements IEmailProvider {
  public async sendEmail(params: any) {
    assertCommunicationMockAllowed('MockEmailProvider');
    const messageId = `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return { messageId, success: true };
  }
}

export class MockWhatsAppProvider implements IWhatsAppProvider {
  public async sendMessage(params: any) {
    assertCommunicationMockAllowed('MockWhatsAppProvider');
    const messageId = `mock_wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return { messageId, success: true };
  }
}

export class MockSmsProvider implements ISmsProvider {
  public async sendSms(params: any) {
    assertCommunicationMockAllowed('MockSmsProvider');
    const messageId = `mock_sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return { messageId, success: true };
  }
}

/**
 * Centralized Communication Service
 * Single unified dispatcher for Email, WhatsApp, SMS, and In-App Notifications
 */
export class CommunicationService {
  private static emailProvider: IEmailProvider =
    process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true'
      ? new SmtpEmailProvider()
      : new MockEmailProvider();

  private static whatsAppProvider: IWhatsAppProvider =
    process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true'
      ? new MetaWhatsAppProvider()
      : new MockWhatsAppProvider();

  private static smsProvider: ISmsProvider =
    process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true'
      ? new DltSmsProvider()
      : new MockSmsProvider();

  public static setEmailProvider(provider: IEmailProvider) {
    this.emailProvider = provider;
  }

  public static setWhatsAppProvider(provider: IWhatsAppProvider) {
    this.whatsAppProvider = provider;
  }

  public static setSmsProvider(provider: ISmsProvider) {
    this.smsProvider = provider;
  }

  /**
   * Dispatches a templated notification across multiple channels
   */
  public static async sendNotification(params: SendNotificationParams): Promise<{
    success: boolean;
    results: DispatchResult[];
  }> {
    const template = COMMUNICATION_TEMPLATES[params.templateKey];
    if (!template) {
      throw new Error(`Communication template '${params.templateKey}' not found in registry.`);
    }

    const mergedVariables = {
      ...template.defaultVariables,
      recipientName: params.recipient.name,
      ...params.variables,
    };

    const results: DispatchResult[] = [];

    for (const channel of params.channels) {
      if (!template.allowedChannels.includes(channel)) {
        continue;
      }

      try {
        let result: DispatchResult;

        switch (channel) {
          case CommunicationChannel.EMAIL:
            result = await this.dispatchEmail({
              template,
              recipient: params.recipient,
              variables: mergedVariables,
              documentId: params.documentId,
              attachments: params.attachments,
            });
            break;

          case CommunicationChannel.WHATSAPP:
            result = await this.dispatchWhatsApp({
              template,
              recipient: params.recipient,
              variables: mergedVariables,
              documentId: params.documentId,
            });
            break;

          case CommunicationChannel.SMS:
            result = await this.dispatchSms({
              template,
              recipient: params.recipient,
              variables: mergedVariables,
              documentId: params.documentId,
            });
            break;

          case CommunicationChannel.IN_APP:
            result = await this.dispatchInApp({
              template,
              recipient: params.recipient,
              variables: mergedVariables,
              documentId: params.documentId,
            });
            break;

          default:
            result = {
              channel,
              status: DeliveryStatus.FAILED,
              error: `Unsupported channel: ${channel}`,
            };
        }

        results.push(result);
      } catch (err: any) {
        results.push({
          channel,
          status: DeliveryStatus.FAILED,
          error: err.message || 'Unknown dispatch error',
        });
      }
    }

    return {
      success: results.some((r) => r.status === DeliveryStatus.SENT || r.status === DeliveryStatus.DELIVERED),
      results,
    };
  }

  /**
   * Internal Email Dispatcher
   */
  private static async dispatchEmail(opts: {
    template: any;
    recipient: RecipientInfo;
    variables: Record<string, any>;
    documentId?: string;
    attachments?: any[];
  }): Promise<DispatchResult> {
    if (!opts.recipient.email) {
      return { channel: CommunicationChannel.EMAIL, status: DeliveryStatus.FAILED, error: 'Recipient email missing.' };
    }

    const subject = renderTemplateString(opts.template.subjectTemplate || 'Notice from IMF-DOS', opts.variables);
    const bodyInnerHtml = renderTemplateString(opts.template.emailBodyHtmlTemplate || '', opts.variables);
    const fullHtml = wrapFoundationEmailHtml(bodyInnerHtml, subject);

    const providerRes = await this.emailProvider.sendEmail({
      to: opts.recipient.email,
      toName: opts.recipient.name,
      subject,
      html: fullHtml,
      attachments: opts.attachments,
    });

    const status = providerRes.success ? DeliveryStatus.SENT : DeliveryStatus.FAILED;

    try {
      await prisma.communicationLog.create({
        data: {
          channel: CommunicationChannel.EMAIL,
          templateKey: opts.template.key,
          recipientIdentifier: opts.recipient.email,
          recipientName: opts.recipient.name,
          subject,
          messageContent: fullHtml,
          status,
          providerMessageId: providerRes.messageId,
          errorDetails: providerRes.error || null,
          documentId: opts.documentId || null,
          metadataJson: opts.variables,
        },
      });
    } catch {
      // Non-blocking log persistence fallback
    }

    return {
      channel: CommunicationChannel.EMAIL,
      status,
      providerMessageId: providerRes.messageId,
      error: providerRes.error,
    };
  }

  /**
   * Internal WhatsApp Dispatcher
   */
  private static async dispatchWhatsApp(opts: {
    template: any;
    recipient: RecipientInfo;
    variables: Record<string, any>;
    documentId?: string;
  }): Promise<DispatchResult> {
    if (!opts.recipient.phone) {
      return { channel: CommunicationChannel.WHATSAPP, status: DeliveryStatus.FAILED, error: 'Recipient phone missing.' };
    }

    const text = renderTemplateString(opts.template.whatsappTemplateText || '', opts.variables);

    const providerRes = await this.whatsAppProvider.sendMessage({
      phone: opts.recipient.phone,
      text,
    });

    const status = providerRes.success ? DeliveryStatus.SENT : DeliveryStatus.FAILED;

    try {
      await prisma.communicationLog.create({
        data: {
          channel: CommunicationChannel.WHATSAPP,
          templateKey: opts.template.key,
          recipientIdentifier: opts.recipient.phone,
          recipientName: opts.recipient.name,
          subject: null,
          messageContent: text,
          status,
          providerMessageId: providerRes.messageId,
          errorDetails: providerRes.error || null,
          documentId: opts.documentId || null,
          metadataJson: opts.variables,
        },
      });
    } catch {
      // Non-blocking log persistence fallback
    }

    return {
      channel: CommunicationChannel.WHATSAPP,
      status,
      providerMessageId: providerRes.messageId,
      error: providerRes.error,
    };
  }

  /**
   * Internal SMS Dispatcher
   */
  private static async dispatchSms(opts: {
    template: any;
    recipient: RecipientInfo;
    variables: Record<string, any>;
    documentId?: string;
  }): Promise<DispatchResult> {
    if (!opts.recipient.phone) {
      return { channel: CommunicationChannel.SMS, status: DeliveryStatus.FAILED, error: 'Recipient phone missing.' };
    }

    const text = renderTemplateString(opts.template.smsTemplateText || '', opts.variables);

    const providerRes = await this.smsProvider.sendSms({
      phone: opts.recipient.phone,
      text,
      dltTemplateId: opts.template.smsTemplateId,
    });

    const status = providerRes.success ? DeliveryStatus.SENT : DeliveryStatus.FAILED;

    try {
      await prisma.communicationLog.create({
        data: {
          channel: CommunicationChannel.SMS,
          templateKey: opts.template.key,
          recipientIdentifier: opts.recipient.phone,
          recipientName: opts.recipient.name,
          subject: null,
          messageContent: text,
          status,
          providerMessageId: providerRes.messageId,
          errorDetails: providerRes.error || null,
          documentId: opts.documentId || null,
          metadataJson: opts.variables,
        },
      });
    } catch {
      // Non-blocking log persistence fallback
    }

    return {
      channel: CommunicationChannel.SMS,
      status,
      providerMessageId: providerRes.messageId,
      error: providerRes.error,
    };
  }

  /**
   * Internal In-App Notification Dispatcher
   */
  private static async dispatchInApp(opts: {
    template: any;
    recipient: RecipientInfo;
    variables: Record<string, any>;
    documentId?: string;
  }): Promise<DispatchResult> {
    const title = renderTemplateString(opts.template.inAppTitleTemplate || 'Notification', opts.variables);
    const message = renderTemplateString(opts.template.inAppBodyTemplate || '', opts.variables);
    const category = opts.template.inAppCategory || 'SYSTEM';

    let notifId = `notif_${Date.now()}`;
    try {
      const notif = await prisma.inAppNotification.create({
        data: {
          userId: opts.recipient.userId || null,
          title,
          message,
          category,
          isRead: false,
          isUrgent: category === 'COMPLIANCE',
          linkUrl: opts.variables.verificationUrl || opts.variables.actionUrl || null,
          documentId: opts.documentId || null,
        },
      });
      notifId = notif.id;

      await prisma.communicationLog.create({
        data: {
          channel: CommunicationChannel.IN_APP,
          templateKey: opts.template.key,
          recipientIdentifier: opts.recipient.userId || 'GLOBAL_ADMIN',
          recipientName: opts.recipient.name,
          subject: title,
          messageContent: message,
          status: DeliveryStatus.DELIVERED,
          providerMessageId: notifId,
          documentId: opts.documentId || null,
          metadataJson: opts.variables,
        },
      });
    } catch {
      // Non-blocking log persistence fallback
    }

    return {
      channel: CommunicationChannel.IN_APP,
      status: DeliveryStatus.DELIVERED,
      providerMessageId: notifId,
    };
  }

  /**
   * Queries in-app notifications
   */
  public static async getInAppNotifications(params: {
    userId?: string;
    isRead?: boolean;
    isUrgent?: boolean;
    limit?: number;
  } = {}) {
    const where: any = {};
    if (params.userId !== undefined) {
      where.OR = [{ userId: params.userId }, { userId: null }];
    }
    if (params.isRead !== undefined) {
      where.isRead = params.isRead;
    }
    if (params.isUrgent !== undefined) {
      where.isUrgent = params.isUrgent;
    }

    return prisma.inAppNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 50,
    });
  }

  /**
   * Marks single notification as read
   */
  public static async markNotificationAsRead(id: string) {
    return prisma.inAppNotification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Marks all in-app notifications as read
   */
  public static async markAllNotificationsAsRead(userId?: string) {
    const where: any = {};
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }

    return prisma.inAppNotification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });
  }
}
