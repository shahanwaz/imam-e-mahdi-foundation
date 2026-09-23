import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationService } from '@/lib/communication/communication-service';
import { CommunicationChannel, DeliveryStatus } from '@prisma/client';
import { renderTemplateString, wrapFoundationEmailHtml } from '@/lib/communication/templates';

// Mock Prisma
vi.mock('@/lib/db', () => {
  const createdLogs: any[] = [];
  const createdNotifications: any[] = [];

  return {
    prisma: {
      communicationLog: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          const log = { id: `log_${Date.now()}_${Math.random()}`, ...data };
          createdLogs.push(log);
          return Promise.resolve(log);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(createdLogs)),
      },
      inAppNotification: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          const notif = { id: `notif_${Date.now()}_${Math.random()}`, ...data, createdAt: new Date() };
          createdNotifications.push(notif);
          return Promise.resolve(notif);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(createdNotifications);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({ id: where.id, isRead: true, readAt: new Date() });
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 5 }),
      },
    },
  };
});

describe('Centralized Communication Engine Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should interpolate template strings with dynamic variables', () => {
    const tmpl = 'Hello {{recipientName}}, your receipt {{documentNumber}} for Rs. {{amount}} is ready.';
    const rendered = renderTemplateString(tmpl, {
      recipientName: 'Syed Ali',
      documentNumber: 'IMF-REC-001',
      amount: '5000',
    });

    expect(rendered).toBe('Hello Syed Ali, your receipt IMF-REC-001 for Rs. 5000 is ready.');
  });

  it('should wrap body HTML with branded Foundation email shell', () => {
    const wrapped = wrapFoundationEmailHtml('<p>Donation Received</p>', 'Receipt Subject');
    expect(wrapped).toContain('<!DOCTYPE html>');
    expect(wrapped).toContain('IMAM MISSION');
    expect(wrapped).toContain('IMAM E MAHDI FOUNDATION');
    expect(wrapped).toContain('Donation Received');
    expect(wrapped).toContain('Receipt Subject');
  });

  it('should dispatch multi-channel notification across Email, WhatsApp, SMS, and In-App', async () => {
    const dispatchRes = await CommunicationService.sendNotification({
      templateKey: 'DONATION_RECEIPT_ISSUED',
      channels: [
        CommunicationChannel.EMAIL,
        CommunicationChannel.WHATSAPP,
        CommunicationChannel.SMS,
        CommunicationChannel.IN_APP,
      ],
      recipient: {
        name: 'Br. Zainul Abideen',
        email: 'zain@example.com',
        phone: '+919876543210',
        userId: 'usr_donor_1',
      },
      variables: {
        documentNumber: 'IMF-REC-2026-00045',
        amount: '25,000.00',
        fundType: 'Zakat al-Mal',
        verificationUrl: 'https://imf.org/verify/doc/sample_hash',
      },
      documentId: 'doc_12345',
    });

    expect(dispatchRes.success).toBe(true);
    expect(dispatchRes.results.length).toBe(4);

    const emailRes = dispatchRes.results.find((r) => r.channel === CommunicationChannel.EMAIL);
    expect(emailRes?.status).toBe(DeliveryStatus.SENT);

    const waRes = dispatchRes.results.find((r) => r.channel === CommunicationChannel.WHATSAPP);
    expect(waRes?.status).toBe(DeliveryStatus.SENT);

    const smsRes = dispatchRes.results.find((r) => r.channel === CommunicationChannel.SMS);
    expect(smsRes?.status).toBe(DeliveryStatus.SENT);

    const inAppRes = dispatchRes.results.find((r) => r.channel === CommunicationChannel.IN_APP);
    expect(inAppRes?.status).toBe(DeliveryStatus.DELIVERED);
  });

  it('should query and update in-app notifications', async () => {
    const notifications = await CommunicationService.getInAppNotifications({
      userId: 'usr_admin_1',
      isRead: false,
    });
    expect(Array.isArray(notifications)).toBe(true);

    const updated = await CommunicationService.markNotificationAsRead('notif_sample_1');
    expect(updated.isRead).toBe(true);

    const allUpdated = await CommunicationService.markAllNotificationsAsRead('usr_admin_1');
    expect(allUpdated.count).toBe(5);
  });

  it('should allow custom Provider SPI registration', async () => {
    let capturedEmail: any = null;

    CommunicationService.setEmailProvider({
      sendEmail: async (params) => {
        capturedEmail = params;
        return { messageId: 'custom_spi_msg_1', success: true };
      },
    });

    await CommunicationService.sendNotification({
      templateKey: 'EMPLOYEE_OFFER_LETTER',
      channels: [CommunicationChannel.EMAIL],
      recipient: {
        name: 'Sister Maryam',
        email: 'maryam@example.com',
      },
      variables: {
        designation: 'Finance Associate',
        annualCTC: '5,00,000.00',
      },
    });

    expect(capturedEmail).toBeDefined();
    expect(capturedEmail.to).toBe('maryam@example.com');
    expect(capturedEmail.subject).toContain('Official Job Offer');
  });
});
