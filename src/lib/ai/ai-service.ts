import { prisma } from '@/lib/db';
import {
  AiTaskType,
  AiSafetyDomain,
  AiDraftStatus,
  AiPromptContext,
  AiModelConfig,
  AiGenerationResult,
} from './types';
import { AiSanitizer } from './sanitizer';
import { AiProviderRegistry } from './providers/registry';

export class AiService {
  /**
   * Generates a new AI content draft adhering to PII sanitization and HITL governance.
   */
  public static async generateDraft(
    context: AiPromptContext,
    modelConfig?: Partial<AiModelConfig>
  ): Promise<{
    draft: any;
    generationResult: AiGenerationResult;
  }> {
    const startTime = Date.now();

    // Step 1: PII Sanitization & Redaction
    const sanitization = AiSanitizer.sanitizePrompt(context.prompt);
    const sanitizedPrompt = sanitization.sanitizedText;

    // Step 2: Safety Domain Detection & Approval Requirement
    const detectedSafetyDomain = AiSanitizer.detectSafetyDomain(
      context.prompt,
      context.taskType
    );
    const requiresHumanApproval = true; // All AI generation follows AI Draft -> Human Review -> Approval -> Publish

    // Step 3: Pluggable Provider Resolution
    const provider = AiProviderRegistry.getProvider(modelConfig?.provider);
    let outputText = '';
    let tokensPrompt = 0;
    let tokensCompletion = 0;
    let modelUsed = provider.defaultModel;
    let isSuccess = true;
    let errorMessage: string | null = null;

    try {
      const response = await provider.generateContent(
        sanitizedPrompt,
        context,
        modelConfig
      );
      outputText = response.text;
      tokensPrompt = response.tokensPrompt;
      tokensCompletion = response.tokensCompletion;
      modelUsed = response.modelUsed;
    } catch (err: any) {
      isSuccess = false;
      errorMessage = err.message || 'Unknown provider error';
      // If external provider fails and isn't MOCK, attempt MOCK fallback
      if (provider.name !== 'MOCK') {
        const mockFallback = AiProviderRegistry.getProvider('MOCK');
        const fallbackRes = await mockFallback.generateContent(
          sanitizedPrompt,
          context,
          modelConfig
        );
        outputText = fallbackRes.text;
        tokensPrompt = fallbackRes.tokensPrompt;
        tokensCompletion = fallbackRes.tokensCompletion;
        modelUsed = `${mockFallback.defaultModel} (Fallback from ${provider.name})`;
        isSuccess = true;
        errorMessage = `Fallback triggered: ${err.message}`;
      } else {
        throw err;
      }
    }

    const latencyMs = Date.now() - startTime;
    const totalTokens = tokensPrompt + tokensCompletion;

    // Step 4: Secure Generation Audit Logging
    try {
      await prisma.aiGenerationLog.create({
        data: {
          taskType: context.taskType,
          safetyDomain: detectedSafetyDomain,
          providerName: provider.name,
          modelName: modelUsed,
          promptSanitized: sanitizedPrompt,
          responsePreview: outputText.slice(0, 500),
          tokensPrompt,
          tokensCompletion,
          latencyMs,
          isSuccess,
          errorMessage,
          createdById: context.userId || 'SYSTEM',
        },
      });
    } catch (logErr) {
      console.error('[AiService] Failed to write generation log:', logErr);
    }

    // Step 5: Draft Record Creation in Database
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const draftCode = `AID-${year}-${randomSuffix}`;

    const draft = await prisma.aiDraftRecord.create({
      data: {
        draftCode,
        taskType: context.taskType,
        safetyDomain: detectedSafetyDomain,
        title: context.title,
        promptSanitized: sanitizedPrompt,
        generatedOutput: outputText,
        status: AiDraftStatus.DRAFT_PENDING_REVIEW,
        providerName: provider.name,
        modelName: modelUsed,
        tokensUsed: totalTokens,
        latencyMs,
        targetModule: context.targetModule || null,
        targetEntityId: context.targetEntityId || null,
        requiresHumanApproval,
        createdById: context.userId || 'SYSTEM',
      },
    });

    const generationResult: AiGenerationResult = {
      rawOutput: outputText,
      sanitizedPrompt,
      providerName: provider.name,
      modelName: modelUsed,
      tokensUsed: {
        prompt: tokensPrompt,
        completion: tokensCompletion,
        total: totalTokens,
      },
      latencyMs,
      detectedSafetyDomain,
      requiresHumanApproval,
    };

    return {
      draft,
      generationResult,
    };
  }

  /**
   * Retrieves drafts based on filters and search queries.
   */
  public static async getDrafts(filters: {
    status?: AiDraftStatus;
    taskType?: AiTaskType;
    safetyDomain?: AiSafetyDomain;
    search?: string;
    limit?: number;
    skip?: number;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.taskType) {
      where.taskType = filters.taskType;
    }
    if (filters.safetyDomain) {
      where.safetyDomain = filters.safetyDomain;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { draftCode: { contains: filters.search, mode: 'insensitive' } },
        { promptSanitized: { contains: filters.search, mode: 'insensitive' } },
        { generatedOutput: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.aiDraftRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.skip || 0,
      }),
      prisma.aiDraftRecord.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Retrieves a single draft record by ID.
   */
  public static async getDraftById(id: string) {
    return prisma.aiDraftRecord.findUnique({
      where: { id },
    });
  }

  /**
   * Performs Human Review on an AI Draft (Edit, Approve, or Reject).
   */
  public static async reviewDraft(
    id: string,
    reviewData: {
      editedOutput?: string;
      status: AiDraftStatus;
      reviewerUserId: string;
      approvalNotes?: string;
    }
  ) {
    const existing = await prisma.aiDraftRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Draft with ID ${id} not found.`);
    }

    if (reviewData.status === AiDraftStatus.PUBLISHED) {
      throw new Error(
        'Cannot set status to PUBLISHED via reviewDraft. Use publishDraft() method after approval.'
      );
    }

    const updated = await prisma.aiDraftRecord.update({
      where: { id },
      data: {
        editedOutput:
          reviewData.editedOutput !== undefined
            ? reviewData.editedOutput
            : existing.editedOutput,
        status: reviewData.status,
        reviewedByUserId: reviewData.reviewerUserId,
        reviewedAt: new Date(),
        approvalNotes: reviewData.approvalNotes || existing.approvalNotes,
      },
    });

    return updated;
  }

  /**
   * Publishes an approved draft to its target module.
   * STRICT SAFETY GATE: Blocks publication if not approved or if sensitive content lacks sign-off.
   */
  public static async publishDraft(id: string, publishedByUserId: string) {
    const draft = await prisma.aiDraftRecord.findUnique({
      where: { id },
    });

    if (!draft) {
      throw new Error(`Draft with ID ${id} not found.`);
    }

    // Mandatory Human Review Check
    if (draft.status !== AiDraftStatus.APPROVED) {
      throw new Error(
        `Direct publication blocked: Draft "${draft.draftCode}" is currently in "${draft.status}" status. It must be explicitly reviewed and set to APPROVED before publishing.`
      );
    }

    // Sensitive Domain Protection Check
    if (
      AiSanitizer.isApprovalMandatory(draft.safetyDomain) &&
      !draft.reviewedByUserId
    ) {
      throw new Error(
        `Direct publication of sensitive ${draft.safetyDomain} content without verified human reviewer sign-off is strictly prohibited.`
      );
    }

    const published = await prisma.aiDraftRecord.update({
      where: { id },
      data: {
        status: AiDraftStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return {
      success: true,
      draft: published,
      finalContent: published.editedOutput || published.generatedOutput,
      targetModule: published.targetModule,
      targetEntityId: published.targetEntityId,
    };
  }
}
