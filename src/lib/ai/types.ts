import { AiTaskType, AiSafetyDomain, AiDraftStatus } from '@prisma/client';

export { AiTaskType, AiSafetyDomain, AiDraftStatus };

export interface AiModelConfig {
  provider: string; // "GEMINI" | "OPENAI" | "ANTHROPIC" | "MOCK"
  modelName: string; // e.g. "gemini-1.5-flash", "gpt-4o-mini", "claude-3-5-sonnet"
  temperature?: number;
  maxTokens?: number;
}

export interface AiPromptContext {
  taskType: AiTaskType;
  title: string;
  prompt: string;
  targetLanguage?: 'en' | 'ur' | 'hi' | 'ar' | string;
  targetAudience?: string;
  tone?: 'INSPIRING' | 'FORMAL' | 'EMPATHETIC' | 'URGENT' | 'EDUCATIONAL' | 'INFORMATIONAL';
  systemContext?: Record<string, any>;
  targetModule?: string;
  targetEntityId?: string;
  userId?: string;
}

export interface AiGenerationResult {
  rawOutput: string;
  sanitizedPrompt: string;
  providerName: string;
  modelName: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  latencyMs: number;
  detectedSafetyDomain: AiSafetyDomain;
  requiresHumanApproval: boolean;
}

export interface IAiProvider {
  readonly name: string;
  readonly defaultModel: string;
  readonly availableModels: string[];
  isConfigured(): boolean;
  generateContent(
    sanitizedPrompt: string,
    context: AiPromptContext,
    config?: Partial<AiModelConfig>
  ): Promise<{
    text: string;
    tokensPrompt: number;
    tokensCompletion: number;
    modelUsed: string;
  }>;
}

export interface AiTaskDefinition {
  type: AiTaskType;
  label: string;
  description: string;
  defaultSafetyDomain: AiSafetyDomain;
  suggestedTones: string[];
  placeholderPrompt: string;
  iconName: string;
}

export const AI_TASK_DEFINITIONS: Record<AiTaskType, AiTaskDefinition> = {
  [AiTaskType.CONTENT_DRAFTING]: {
    type: AiTaskType.CONTENT_DRAFTING,
    label: 'Content Drafting',
    description: 'Draft general organizational content, announcements, and notices.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['INSPIRING', 'INFORMATIONAL', 'EMPATHETIC'],
    placeholderPrompt: 'Draft an announcement for the upcoming community iftar program...',
    iconName: 'DocumentTextIcon',
  },
  [AiTaskType.CAMPAIGN_WRITING]: {
    type: AiTaskType.CAMPAIGN_WRITING,
    label: 'Campaign Writing',
    description: 'Create compelling fundraising and emergency disaster relief appeals.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['URGENT', 'INSPIRING', 'EMPATHETIC'],
    placeholderPrompt: 'Write a crowdfunding appeal for clean drinking water in flood-affected districts...',
    iconName: 'SparklesIcon',
  },
  [AiTaskType.BLOG_DRAFTING]: {
    type: AiTaskType.BLOG_DRAFTING,
    label: 'Blog Drafting',
    description: 'Write engaging articles, success stories, and educational field journals.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['EDUCATIONAL', 'INSPIRING', 'INFORMATIONAL'],
    placeholderPrompt: 'Draft a blog post highlighting our educational scholarship beneficiaries this term...',
    iconName: 'PencilSquareIcon',
  },
  [AiTaskType.EMAIL_DRAFTING]: {
    type: AiTaskType.EMAIL_DRAFTING,
    label: 'Email Drafting',
    description: 'Compose newsletters, donor thank-you notes, and updates with subject lines.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['FORMAL', 'EMPATHETIC', 'INSPIRING'],
    placeholderPrompt: 'Compose a donor appreciation email for recurring monthly patrons...',
    iconName: 'EnvelopeIcon',
  },
  [AiTaskType.WHATSAPP_DRAFTING]: {
    type: AiTaskType.WHATSAPP_DRAFTING,
    label: 'WhatsApp Drafting',
    description: 'Format concise, high-impact messages with emojis and clear call-to-actions.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['URGENT', 'EMPATHETIC', 'INSPIRING'],
    placeholderPrompt: 'Draft a brief WhatsApp broadcast message about our weekend ration distribution drive...',
    iconName: 'ChatBubbleLeftRightIcon',
  },
  [AiTaskType.TRANSLATION]: {
    type: AiTaskType.TRANSLATION,
    label: 'Multilingual Translation',
    description: 'Translate documents and notices seamlessly between English, Urdu, Hindi, and Arabic.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['FORMAL', 'INFORMATIONAL'],
    placeholderPrompt: 'Translate this community medical clinic announcement into Urdu and Hindi...',
    iconName: 'LanguageIcon',
  },
  [AiTaskType.SUMMARIZATION]: {
    type: AiTaskType.SUMMARIZATION,
    label: 'Summarization',
    description: 'Condense lengthy reports, meeting minutes, and field survey journals into executive briefs.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['FORMAL', 'INFORMATIONAL'],
    placeholderPrompt: 'Summarize the 30-page annual field survey report into 5 key bullet points...',
    iconName: 'ClipboardDocumentListIcon',
  },
  [AiTaskType.REPORT_DRAFTING]: {
    type: AiTaskType.REPORT_DRAFTING,
    label: 'Report Drafting',
    description: 'Draft quarterly progress reports, event summaries, and operational updates.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['FORMAL', 'INFORMATIONAL'],
    placeholderPrompt: 'Draft an executive summary of our Q2 vocational training initiatives...',
    iconName: 'ChartBarSquareIcon',
  },
  [AiTaskType.IMPACT_REPORT_DRAFTING]: {
    type: AiTaskType.IMPACT_REPORT_DRAFTING,
    label: 'Impact Report Drafting',
    description: 'Draft data-driven impact assessments with beneficiary statistics and narrative outcomes.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['INSPIRING', 'FORMAL'],
    placeholderPrompt: 'Draft the 2026 Winter Warmth drive impact assessment highlighting 1,200 kits distributed...',
    iconName: 'TrophyIcon',
  },
  [AiTaskType.DATA_INSIGHTS]: {
    type: AiTaskType.DATA_INSIGHTS,
    label: 'Data Insights',
    description: 'Extract trends, seasonal patterns, and key takeaways from raw donation or program metrics.',
    defaultSafetyDomain: AiSafetyDomain.FINANCIAL,
    suggestedTones: ['INFORMATIONAL', 'FORMAL'],
    placeholderPrompt: 'Analyze this month’s donation volume trends across online vs offline collections...',
    iconName: 'LightBulbIcon',
  },
  [AiTaskType.DASHBOARD_EXPLANATION]: {
    type: AiTaskType.DASHBOARD_EXPLANATION,
    label: 'Dashboard Explanations',
    description: 'Convert complex charts, financial ratios, and operational KPIs into plain language explanations.',
    defaultSafetyDomain: AiSafetyDomain.FINANCIAL,
    suggestedTones: ['EDUCATIONAL', 'FORMAL'],
    placeholderPrompt: 'Explain why the administrative cost ratio dropped from 12% to 7% this quarter...',
    iconName: 'PresentationChartLineIcon',
  },
  [AiTaskType.FAQ_GENERATION]: {
    type: AiTaskType.FAQ_GENERATION,
    label: 'FAQ Generation',
    description: 'Generate comprehensive Frequently Asked Questions with clear, reassuring answers.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['EDUCATIONAL', 'EMPATHETIC'],
    placeholderPrompt: 'Generate an FAQ section regarding 80G tax exemption receipts for donors...',
    iconName: 'QuestionMarkCircleIcon',
  },
  [AiTaskType.SEO_ASSISTANCE]: {
    type: AiTaskType.SEO_ASSISTANCE,
    label: 'SEO Assistance',
    description: 'Generate meta titles, meta descriptions, focus keywords, and schema markup recommendations.',
    defaultSafetyDomain: AiSafetyDomain.GENERAL_PUBLIC,
    suggestedTones: ['INFORMATIONAL'],
    placeholderPrompt: 'Generate SEO meta title, description, and keywords for our Orphan Sponsorship Program...',
    iconName: 'MagnifyingGlassIcon',
  },
};
