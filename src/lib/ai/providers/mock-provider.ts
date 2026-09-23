import { BaseAiProvider } from './base-provider';
import { AiModelConfig, AiPromptContext, AiTaskType } from '../types';

export class MockAiProvider extends BaseAiProvider {
  readonly name = 'MOCK';
  readonly defaultModel = 'imf-deterministic-ai-v1';
  readonly availableModels = ['imf-deterministic-ai-v1', 'imf-deterministic-ai-v2'];

  isConfigured(): boolean {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
      return false;
    }
    return true;
  }

  async generateContent(
    sanitizedPrompt: string,
    context: AiPromptContext,
    config?: Partial<AiModelConfig>
  ): Promise<{
    text: string;
    tokensPrompt: number;
    tokensCompletion: number;
    modelUsed: string;
  }> {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_IN_PRODUCTION !== 'true') {
      throw new Error(
        '[AI_SECURITY_VIOLATION] MockAiProvider cannot be executed in NODE_ENV=production. Configure live LLM providers (GEMINI, OPENAI, ANTHROPIC) or set ALLOW_MOCK_IN_PRODUCTION=true.'
      );
    }
    const modelUsed = config?.modelName || this.defaultModel;
    const lang = context.targetLanguage || 'en';
    const title = context.title || 'Initiative';

    let text = '';

    switch (context.taskType) {
      case AiTaskType.CONTENT_DRAFTING:
        text = this.generateContentDraft(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.CAMPAIGN_WRITING:
        text = this.generateCampaign(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.BLOG_DRAFTING:
        text = this.generateBlog(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.EMAIL_DRAFTING:
        text = this.generateEmail(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.WHATSAPP_DRAFTING:
        text = this.generateWhatsApp(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.TRANSLATION:
        text = this.generateTranslation(sanitizedPrompt, lang);
        break;
      case AiTaskType.SUMMARIZATION:
        text = this.generateSummary(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.REPORT_DRAFTING:
        text = this.generateReport(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.IMPACT_REPORT_DRAFTING:
        text = this.generateImpactReport(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.DATA_INSIGHTS:
        text = this.generateDataInsights(title, sanitizedPrompt);
        break;
      case AiTaskType.DASHBOARD_EXPLANATION:
        text = this.generateDashboardExplanation(title, sanitizedPrompt);
        break;
      case AiTaskType.FAQ_GENERATION:
        text = this.generateFaq(title, sanitizedPrompt, lang);
        break;
      case AiTaskType.SEO_ASSISTANCE:
        text = this.generateSeo(title, sanitizedPrompt);
        break;
      default:
        text = `## ${title}\n\n**Task:** ${context.taskType}\n\n${sanitizedPrompt}\n\n*Draft generated for review.*`;
    }

    const tokensPrompt = this.estimateTokenCount(sanitizedPrompt);
    const tokensCompletion = this.estimateTokenCount(text);

    return {
      text,
      tokensPrompt,
      tokensCompletion,
      modelUsed,
    };
  }

  private generateContentDraft(title: string, prompt: string, lang: string): string {
    if (lang === 'ur') {
      return `### ${title}\n\nامام مہدی فاؤنڈیشن کے زیر اہتمام اس اقدام کا مقصد مستحق خاندانوں کی فوری امداد اور بہبود کو یقینی بنانا ہے۔\n\n**اہم تفصیلات:**\n- پروجیکٹ فوکس: امدادی سرگرمیاں اور فلاحی کام\n- رابطہ و تصدیق: مجاز نمائندگان برائے تنظیم\n\n*نوٹ: یہ ابتدائی مسودہ ہے اور جائزہ کا متقاضی ہے۔*`;
    }
    return `### ${title}\n\n**Executive Overview:**\nImam E Mahdi Foundation is pleased to present this initiative aimed at uplifting underserved communities and providing dignified welfare assistance.\n\n**Key Highlights:**\n- Targeted beneficiary relief and community development.\n- Transparent, auditable execution through field teams.\n- Grassroots verification and real-time monitoring.\n\n*Prompt Context: ${prompt}*`;
  }

  private generateCampaign(title: string, prompt: string, lang: string): string {
    return `## 🌟 Urgent Appeal: ${title}\n\n**"Whoever relieves a believer's hardship, Allah will relieve their hardship on the Day of Resurrection."**\n\n### The Need\nIn response to urgent socioeconomic distress and pressing field needs, our dedicated disaster response teams are mobilizing immediate resources to deliver dignified sustenance, shelter, and medical care.\n\n### How Your Contribution Helps\n- **₹1,500** provides a nutritious 1-month family ration kit.\n- **₹5,000** supports emergency medical aid and life-saving diagnostics.\n- **₹10,000** sponsors urgent shelter rehabilitation.\n\n### Transparency & Direct Impact\nEvery single donation is cryptographically tracked with an instant verifiable acknowledgment receipt. Full audit trail available on our donor portal.\n\n👉 **Donate Now & Save Lives**\n\n*Reference: ${prompt}*`;
  }

  private generateBlog(title: string, prompt: string, lang: string): string {
    return `# ${title}\n\n*Published by Imam E Mahdi Foundation Editorial Team*\n\n### Introduction\nAcross marginalized urban clusters and remote rural districts, access to basic sustenance and education remains a monumental challenge. Yet, through collective faith, solidarity, and structured grassroots action, change is taking root.\n\n### Voices from the Field\nWhen our field coordinators first visited the area, families were struggling with chronic distress. Today, through your continuous patronage, over 250 families have achieved nutritional stability.\n\n> "The assistance did not just feed our children; it restored our honor and hope for tomorrow."\n\n### The Way Forward\nSustaining long-term empowerment requires continuous partnership. We invite you to join our journey of community transformation.\n\n*Editorial Notes: ${prompt}*`;
  }

  private generateEmail(title: string, prompt: string, lang: string): string {
    return `Subject: Transformative Update: ${title}\n\nDear Respected Supporter,\n\nAssalamu Alaikum wa Rahmatullahi wa Barakatuh,\n\nWe hope this message finds you and your loved ones in the highest states of health and faith.\n\nOn behalf of the trustees and field team at **Imam E Mahdi Foundation**, we want to share a brief update regarding our recent progress: **${title}**.\n\nThanks to your generous contributions:\n- Direct aid was delivered to verified beneficiaries with full dignity.\n- Instant automated donation acknowledgment receipts have been generated.\n- Milestone progress is live on our public dashboard.\n\nWe pray that Almighty Allah blesses you abundantly for your generosity.\n\nWarm regards,\n**Executive Secretariat**\nImam E Mahdi Foundation\n\n*Context: ${prompt}*`;
  }

  private generateWhatsApp(title: string, prompt: string, lang: string): string {
    return `🌙 *Imam E Mahdi Foundation - Urgent Update*\n\n📢 *${title}*\n\nAssalamu Alaikum! Our ground team is actively executing emergency relief operations.\n\n✅ 100% Sharia & Transparency Verified\n✅ Cryptographic QR Donation Receipt\n✅ Direct Beneficiary Delivery\n\n🤝 *Support Today:* https://imf-ngo.org/donate\n\n_Prompt notes: ${prompt}_`;
  }

  private generateTranslation(prompt: string, targetLang: string): string {
    if (targetLang === 'ur') {
      return `### اردو ترجمہ (Urdu Translation):\n\nامام مہدی فاؤنڈیشن تمام معزز عطیہ دہندگان اور خیر خواہوں کا تہہ دل سے شکریہ ادا करती ہے۔ آپ کا تعاون ضرورت مند اور مستحق خاندانوں کے لیے امید کی کرن ہے۔\n\nاصل عبارت:\n"${prompt}"`;
    }
    if (targetLang === 'hi') {
      return `### हिंदी अनुवाद (Hindi Translation):\n\nइमाम ए महदी फाउंडेशन सभी सम्मानित दानदाताओं और शुभचिंतकों का हृदय से आभार व्यक्त करता है। आपका सहयोग जरूरतमंद और वंचित परिवारों के लिए आशा की किरण है।\n\nमूल संदर्भ:\n"${prompt}"`;
    }
    if (targetLang === 'ar') {
      return `### الترجمة العربية (Arabic Translation):\n\nتتقدم مؤسسة الإمام المهدي بجزيل الشكر والتقدير لجميع المتبرعين الكرام على دعمهم السخي للأسر المحتاجة.\n\nالنص الأصلي:\n"${prompt}"`;
    }
    return `### English Translation:\n\nImam E Mahdi Foundation expresses its heartfelt gratitude to all esteemed donors and supporters. Your generous contribution serves as a beacon of hope for families in distress.\n\nOriginal prompt: "${prompt}"`;
  }

  private generateSummary(title: string, prompt: string, lang: string): string {
    return `## Executive Summary: ${title}\n\n### Key Takeaways\n1. **Strategic Intent:** Mobilization of resources for targeted welfare initiatives.\n2. **Operational Scope:** Multi-phase field execution with end-to-end PII encryption and compliance.\n3. **Financial Governance:** Strict allocation adherence with zero unverified leakage.\n4. **Audit Sign-Off:** Continuous administrative review prior to final milestone closure.\n\n*Analyzed from input content of ${prompt.length} characters.*`;
  }

  private generateReport(title: string, prompt: string, lang: string): string {
    return `# Comprehensive Operational Report: ${title}\n\n**Reporting Entity:** Imam E Mahdi Foundation Operations Bureau\n**Date:** ${new Date().toISOString().split('T')[0]}\n\n## 1. Project Background\nThis initiative was commissioned to address acute community deficits identified during baseline surveys.\n\n## 2. Resource Deployment & Metrics\n- **Field Personnel Engaged:** 18 Coordinators & Volunteers\n- **Verification Compliance:** 100% KYC & Household Verification\n- **Resolution Rate:** 94.2% on-time milestone delivery\n\n## 3. Challenges & Mitigation\nLogistical bottlenecks in heavy monsoon zones were mitigated via localized distribution hubs.\n\n*Submitted based on input: ${prompt}*`;
  }

  private generateImpactReport(title: string, prompt: string, lang: string): string {
    return `# 📊 Annual Impact & Beneficiary Assessment: ${title}\n\n### 1. Cumulative Impact Summary\n- **Families Supported:** 3,450+ Households\n- **Nutritional Aid Distributed:** 42 Metric Tonnes of High-Grade Grains & Essentials\n- **Medical Treatments Sponsored:** 620 Critical Surgeries and Diagnostics\n- **Educational Scholarships:** 185 Students across Primary and Higher Education\n\n### 2. Theory of Change\nBy combining emergency survival relief with structured capacity building, 41% of assisted families have graduated from extreme vulnerability to sustainable self-reliance.\n\n### 3. Audited Financial Efficiency\n- **Direct Programmatic Expenditure:** 89.4%\n- **Administrative & Statutory Compliance:** 6.1%\n- **Fundraising & Community Outreach:** 4.5%\n\n*Data context: ${prompt}*`;
  }

  private generateDataInsights(title: string, prompt: string): string {
    return `## 📈 Data Insights & Analytical Breakdown: ${title}\n\n> ⚠️ **CONFIDENTIAL FINANCIAL INSIGHTS - REQUIRES HUMAN REVIEW**\n\n### Key Metric Observations\n1. **Seasonal Surge Detected:** Donation inflow peaks by 340% during Ramadan and Muharram cycles.\n2. **Channel Efficiency:** Digital UPI and Gateway contributions now represent 78% of aggregate receipts, reducing physical collection overhead by 62%.\n3. **Recurring Donor Retention:** Donors on monthly auto-debit plans demonstrate an 88% annual retention rate compared to 34% for one-off givers.\n\n### Recommended Actions\n- Expand automated recurring contribution nudges 30 days prior to major giving seasons.\n- Reallocate 15% of surplus disaster reserves to emergency medical quick-response funds.\n\n*Analytical basis: ${prompt}*`;
  }

  private generateDashboardExplanation(title: string, prompt: string): string {
    return `## 📊 Dashboard KPI Explanation: ${title}\n\n### Metric Context\nThis metric visualizes the ratio between total donations received versus actual disbursed field aid within the current financial cycle.\n\n### What the Trends Indicate\n- **Green Threshold (>85%):** Healthy capital deployment to ground programs.\n- **Disbursement Velocity:** Average turnaround time from donor receipt to field delivery has decreased to **48 hours**.\n- **Burn Rate:** Operating expenses are well within the statutory 15% administrative ceiling prescribed under Indian NGO regulations.\n\n*Query context: ${prompt}*`;
  }

  private generateFaq(title: string, prompt: string, lang: string): string {
    return `## ❓ Frequently Asked Questions: ${title}\n\n**Q1: How does Imam E Mahdi Foundation verify beneficiaries?**\n*A:* Every beneficiary undergoes a 3-tier verification process: physical doorstep survey, Aadhaar/PAN KYC authentication, and local community referee cross-verification.\n\n**Q2: Are my donations eligible for income tax exemption?**\n*A:* Every contribution receives an official cryptographically-verified Donation Acknowledgment Receipt. Please note Section 80G tax exemption approval is currently undergoing formal statutory processing with the Income Tax Department.\n\n**Q3: How can I track where my funds were spent?**\n*A:* Every registered patron receives an encrypted donor dashboard link where project milestones, geotagged field photos, and audited expense statements are viewable in real-time.\n\n*Generated for prompt: ${prompt}*`;
  }

  private generateSeo(title: string, prompt: string): string {
    return `## 🔍 SEO Metadata & Search Optimization: ${title}\n\n**1. Recommended Meta Title (<60 chars):**\n\`${title} | Imam E Mahdi Foundation\`\n\n**2. Meta Description (<160 chars):**\n\`Support ${title} with Imam E Mahdi Foundation. 100% transparent charity with cryptographic receipts. Donate online and empower lives today.\`\n\n**3. Primary Focus Keywords:**\n- \`donate to ${title.toLowerCase()}\`\n- \`islamic charity india verified\`\n- \`imam e mahdi foundation relief\`\n- \`verified ngo donations\`\n\n**4. Schema Markup (JSON-LD Organization / NonProfit):**\n\`\`\`json\n{\n  "@context": "https://schema.org",\n  "@type": "NGO",\n  "name": "Imam E Mahdi Foundation",\n  "url": "https://imf-ngo.org",\n  "description": "Transparent Islamic charitable trust providing emergency relief, education, and healthcare."\n}\n\`\`\`\n\n*Optimization basis: ${prompt}*`;
  }
}
