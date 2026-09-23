import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiSanitizer } from '@/lib/ai/sanitizer';
import { AiProviderRegistry } from '@/lib/ai/providers/registry';
import { MockAiProvider } from '@/lib/ai/providers/mock-provider';
import { BaseAiProvider } from '@/lib/ai/providers/base-provider';
import { AiService } from '@/lib/ai/ai-service';
import { AiTaskType, AiSafetyDomain, AiDraftStatus, IAiProvider } from '@/lib/ai/types';

// Mock Prisma for deterministic unit testing
vi.mock('@/lib/db', () => {
  const draftsStore: any[] = [];
  const logsStore: any[] = [];

  return {
    prisma: {
      aiDraftRecord: {
        create: vi.fn().mockImplementation(({ data }) => {
          const record = { id: `draft_${Date.now()}_${Math.random()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          draftsStore.push(record);
          return Promise.resolve(record);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          let filtered = [...draftsStore];
          if (where?.status) {
            filtered = filtered.filter((d) => d.status === where.status);
          }
          if (where?.safetyDomain) {
            filtered = filtered.filter((d) => d.safetyDomain === where.safetyDomain);
          }
          return Promise.resolve(filtered);
        }),
        count: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(draftsStore.length);
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const item = draftsStore.find((d) => d.id === where.id);
          return Promise.resolve(item || null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const index = draftsStore.findIndex((d) => d.id === where.id);
          if (index >= 0) {
            draftsStore[index] = { ...draftsStore[index], ...data, updatedAt: new Date() };
            return Promise.resolve(draftsStore[index]);
          }
          return Promise.resolve(null);
        }),
      },
      aiGenerationLog: {
        create: vi.fn().mockImplementation(({ data }) => {
          const log = { id: `log_${Date.now()}`, ...data, createdAt: new Date() };
          logsStore.push(log);
          return Promise.resolve(log);
        }),
      },
    },
  };
});

describe('AI Agent & Enterprise Intelligence Suite Tests', () => {
  describe('1. PII Sanitization & Redaction Engine', () => {
    it('should mask Indian PAN numbers correctly', () => {
      const input = 'Please disburse funds to donor PAN ABCDE1234F for 80G.';
      const res = AiSanitizer.sanitizePrompt(input);
      expect(res.sanitizedText).toContain('[REDACTED_PAN]');
      expect(res.sanitizedText).not.toContain('ABCDE1234F');
      expect(res.redactedCounts.panNumbers).toBe(1);
    });

    it('should mask Indian Aadhaar numbers correctly', () => {
      const input = 'Beneficiary KYC Aadhaar 2345 6789 0123 has been verified.';
      const res = AiSanitizer.sanitizePrompt(input);
      expect(res.sanitizedText).toContain('[REDACTED_AADHAAR]');
      expect(res.sanitizedText).not.toContain('2345 6789 0123');
      expect(res.redactedCounts.aadhaarNumbers).toBe(1);
    });

    it('should mask email addresses and phone numbers', () => {
      const input = 'Contact donor at donor.ahmed@example.com or call +91 9876543210 for ration kit distribution.';
      const res = AiSanitizer.sanitizePrompt(input);
      expect(res.sanitizedText).toContain('[REDACTED_EMAIL]');
      expect(res.sanitizedText).toContain('[REDACTED_PHONE]');
      expect(res.sanitizedText).not.toContain('donor.ahmed@example.com');
      expect(res.sanitizedText).not.toContain('9876543210');
      expect(res.hasRedactions).toBe(true);
    });

    it('should mask Bank Account numbers and Payment Cards', () => {
      const input = 'Transfer aid to Bank Account AC# 98765432109876 with card 4111 2222 3333 4444.';
      const res = AiSanitizer.sanitizePrompt(input);
      expect(res.sanitizedText).toContain('[REDACTED_BANK_ACCOUNT]');
      expect(res.sanitizedText).toContain('[REDACTED_PAYMENT_CARD]');
    });
  });

  describe('2. Safety Domain & Sensitivity Classification', () => {
    it('should detect LEGAL domain for contract and dispute keywords', () => {
      const domain = AiSanitizer.detectSafetyDomain(
        'Draft a memorandum of understanding (MoU) and lease contract for our relief camp venue.',
        AiTaskType.CONTENT_DRAFTING
      );
      expect(domain).toBe(AiSafetyDomain.LEGAL);
      expect(AiSanitizer.isApprovalMandatory(domain)).toBe(true);
    });

    it('should detect COMPLIANCE domain for 80G, 12A, FCRA, and ROC keywords', () => {
      const domain = AiSanitizer.detectSafetyDomain(
        'Prepare explanation for Form 10BD and Section 80G statutory filings.',
        AiTaskType.REPORT_DRAFTING
      );
      expect(domain).toBe(AiSafetyDomain.COMPLIANCE);
      expect(AiSanitizer.isApprovalMandatory(domain)).toBe(true);
    });

    it('should detect FINANCIAL domain for balance sheet and tax deduction keywords', () => {
      const domain = AiSanitizer.detectSafetyDomain(
        'Explain the quarterly balance sheet and TDS reconciliation ledger.',
        AiTaskType.DASHBOARD_EXPLANATION
      );
      expect(domain).toBe(AiSafetyDomain.FINANCIAL);
      expect(AiSanitizer.isApprovalMandatory(domain)).toBe(true);
    });

    it('should detect GENERAL_PUBLIC for community fundraising campaigns', () => {
      const domain = AiSanitizer.detectSafetyDomain(
        'Write an inspiring community appeal for winter blanket distribution to 500 families.',
        AiTaskType.CAMPAIGN_WRITING
      );
      expect(domain).toBe(AiSafetyDomain.GENERAL_PUBLIC);
    });
  });

  describe('3. Pluggable AI Provider SPI & Registry', () => {
    it('should list configured providers including MOCK, GEMINI, OPENAI, ANTHROPIC', () => {
      const providers = AiProviderRegistry.listProviders();
      const names = providers.map((p) => p.name);
      expect(names).toContain('MOCK');
      expect(names).toContain('GEMINI');
      expect(names).toContain('OPENAI');
      expect(names).toContain('ANTHROPIC');
    });

    it('should allow registering a custom provider dynamically', () => {
      class CustomTestProvider extends BaseAiProvider {
        readonly name = 'CUSTOM_TEST';
        readonly defaultModel = 'test-model-v1';
        readonly availableModels = ['test-model-v1'];
        isConfigured() {
          return true;
        }
        async generateContent(sanitizedPrompt: string) {
          return {
            text: `Custom Provider Response: ${sanitizedPrompt}`,
            tokensPrompt: 10,
            tokensCompletion: 10,
            modelUsed: 'test-model-v1',
          };
        }
      }

      AiProviderRegistry.registerProvider(new CustomTestProvider());
      const provider = AiProviderRegistry.getProvider('CUSTOM_TEST');
      expect(provider.name).toBe('CUSTOM_TEST');
    });
  });

  describe('4. Comprehensive Execution of 13 Core Intelligence Tasks', () => {
    const mockProvider = new MockAiProvider();

    const tasks: AiTaskType[] = [
      AiTaskType.CONTENT_DRAFTING,
      AiTaskType.CAMPAIGN_WRITING,
      AiTaskType.BLOG_DRAFTING,
      AiTaskType.EMAIL_DRAFTING,
      AiTaskType.WHATSAPP_DRAFTING,
      AiTaskType.TRANSLATION,
      AiTaskType.SUMMARIZATION,
      AiTaskType.REPORT_DRAFTING,
      AiTaskType.IMPACT_REPORT_DRAFTING,
      AiTaskType.DATA_INSIGHTS,
      AiTaskType.DASHBOARD_EXPLANATION,
      AiTaskType.FAQ_GENERATION,
      AiTaskType.SEO_ASSISTANCE,
    ];

    tasks.forEach((taskType) => {
      it(`should successfully generate content for task: ${taskType}`, async () => {
        const res = await mockProvider.generateContent(
          'Sample non-profit operational initiative',
          {
            taskType,
            title: 'Medical Camp Relief',
            prompt: 'Sample non-profit operational initiative',
            targetLanguage: 'en',
            tone: 'FORMAL',
          }
        );

        expect(res.text).toBeDefined();
        expect(res.text.length).toBeGreaterThan(20);
        expect(res.tokensPrompt).toBeGreaterThan(0);
        expect(res.tokensCompletion).toBeGreaterThan(0);
        expect(res.modelUsed).toBe(mockProvider.defaultModel);
      });
    });

    it('should generate multilingual translations in Urdu, Hindi, Arabic, and English', async () => {
      const urduRes = await mockProvider.generateContent('Gratitude to donors', {
        taskType: AiTaskType.TRANSLATION,
        title: 'Thank You',
        prompt: 'Gratitude to donors',
        targetLanguage: 'ur',
      });
      expect(urduRes.text).toContain('اردو ترجمہ');

      const hindiRes = await mockProvider.generateContent('Gratitude to donors', {
        taskType: AiTaskType.TRANSLATION,
        title: 'Thank You',
        prompt: 'Gratitude to donors',
        targetLanguage: 'hi',
      });
      expect(hindiRes.text).toContain('हिंदी अनुवाद');

      const arabicRes = await mockProvider.generateContent('Gratitude to donors', {
        taskType: AiTaskType.TRANSLATION,
        title: 'Thank You',
        prompt: 'Gratitude to donors',
        targetLanguage: 'ar',
      });
      expect(arabicRes.text).toContain('الترجمة العربية');
    });
  });

  describe('5. Strict Human-in-the-Loop (HITL) Workflow & Safety Gates', () => {
    it('should enforce full lifecycle: AI Draft -> Human Review -> Approval -> Publish', async () => {
      // Step 1: AI Draft Generation
      const { draft, generationResult } = await AiService.generateDraft(
        {
          taskType: AiTaskType.CAMPAIGN_WRITING,
          title: 'Flood Relief Emergency Fund',
          prompt: 'Urgent appeal for 1000 family ration kits for flood survivors. Contact +91 9876543210.',
          targetLanguage: 'en',
          tone: 'URGENT',
          targetModule: 'CAMPAIGNS',
        },
        { provider: 'MOCK' }
      );

      expect(draft.id).toBeDefined();
      expect(draft.draftCode).toMatch(/^AID-\d{4}-\d+$/);
      expect(draft.status).toBe(AiDraftStatus.DRAFT_PENDING_REVIEW);
      expect(draft.promptSanitized).toContain('[REDACTED_PHONE]');
      expect(draft.requiresHumanApproval).toBe(true);

      // Step 2: Attempting to publish an unapproved draft MUST fail with error
      await expect(AiService.publishDraft(draft.id, 'OPERATOR_1')).rejects.toThrow(
        /Direct publication blocked/
      );

      // Step 3: Human Review & Edit
      const reviewed = await AiService.reviewDraft(draft.id, {
        status: AiDraftStatus.APPROVED,
        editedOutput: `${draft.generatedOutput}\n\n[Human Verified: Sharia & Compliance Certified]`,
        reviewerUserId: 'TRUSTEE_CHAIRMAN',
        approvalNotes: 'Reviewed and verified numbers for accuracy.',
      });

      expect(reviewed.status).toBe(AiDraftStatus.APPROVED);
      expect(reviewed.reviewedByUserId).toBe('TRUSTEE_CHAIRMAN');
      expect(reviewed.editedOutput).toContain('Human Verified');

      // Step 4: Publish Approved Content
      const published = await AiService.publishDraft(draft.id, 'TRUSTEE_CHAIRMAN');
      expect(published.success).toBe(true);
      expect(published.draft.status).toBe(AiDraftStatus.PUBLISHED);
      expect(published.finalContent).toContain('Human Verified');
    });

    it('should block direct publishing of sensitive Legal/Financial/Compliance content without human approval', async () => {
      const { draft } = await AiService.generateDraft(
        {
          taskType: AiTaskType.REPORT_DRAFTING,
          title: 'Annual Statutory Audit & Form 10B Compliance Summary',
          prompt: 'Draft an overview of balance sheet, 12A exemption, and statutory audit findings.',
        },
        { provider: 'MOCK' }
      );

      expect(draft.safetyDomain).toBe(AiSafetyDomain.COMPLIANCE);

      // Attempting to publish without human approval must fail
      await expect(AiService.publishDraft(draft.id, 'OPERATOR_2')).rejects.toThrow(
        /Direct publication blocked/
      );
    });
  });
});
