/**
 * SEO Validation Utility
 * Validates content entries for missing SEO fields and provides build-time warnings
 */

export interface SEOValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface SEOFieldRequirements {
  title: { required: boolean; minLength?: number; maxLength?: number };
  description: { required: boolean; minLength?: number; maxLength?: number };
  image?: { required: boolean };
  tags?: { required: boolean; minCount?: number };
  author?: { required: boolean };
  pubDate?: { required: boolean };
  canonical?: { required: boolean };
}

const DEFAULT_REQUIREMENTS: SEOFieldRequirements = {
  title: { required: true, minLength: 10, maxLength: 60 },
  description: { required: true, minLength: 50, maxLength: 160 },
  image: { required: false },
  tags: { required: true, minCount: 1 },
  author: { required: false },
  pubDate: { required: true },
  canonical: { required: false },
};

/**
 * Validates SEO fields for a content entry
 */
export function validateSEOFields(
  entry: any,
  slug: string,
  contentType: string = 'content',
  requirements: SEOFieldRequirements = DEFAULT_REQUIREMENTS
): SEOValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const data = entry.data || entry;
  const prefix = `[${contentType}:${slug}]`;

  // Title validation
  if (requirements.title.required) {
    if (!data.title) {
      errors.push(`${prefix} Missing required field: title`);
    } else {
      const titleLength = data.title.length;
      if (requirements.title.minLength && titleLength < requirements.title.minLength) {
        warnings.push(`${prefix} Title too short (${titleLength} chars, recommended: ${requirements.title.minLength}+): "${data.title}"`);
      }
      if (requirements.title.maxLength && titleLength > requirements.title.maxLength) {
        warnings.push(`${prefix} Title too long (${titleLength} chars, recommended: <${requirements.title.maxLength}): "${data.title.slice(0, 50)}..."`);
      }
    }
  }

  // Description validation
  if (requirements.description.required) {
    if (!data.description) {
      errors.push(`${prefix} Missing required field: description`);
    } else {
      const descLength = data.description.length;
      if (requirements.description.minLength && descLength < requirements.description.minLength) {
        warnings.push(`${prefix} Description too short (${descLength} chars, recommended: ${requirements.description.minLength}+)`);
      }
      if (requirements.description.maxLength && descLength > requirements.description.maxLength) {
        warnings.push(`${prefix} Description too long (${descLength} chars, recommended: <${requirements.description.maxLength})`);
      }
    }
  }

  // Image validation
  if (requirements.image?.required && !data.heroImage && !data.image) {
    warnings.push(`${prefix} Missing heroImage - recommended for better social sharing`);
  }

  // Tags validation
  if (requirements.tags?.required) {
    if (!data.tags || data.tags.length === 0) {
      warnings.push(`${prefix} Missing tags - recommended for better SEO and discoverability`);
    } else if (requirements.tags.minCount && data.tags.length < requirements.tags.minCount) {
      warnings.push(`${prefix} Only ${data.tags.length} tag(s) - recommended: ${requirements.tags.minCount}+`);
    }
  }

  // Author validation
  if (requirements.author?.required && !data.author) {
    warnings.push(`${prefix} Missing author field`);
  }

  // Publication date validation
  if (requirements.pubDate?.required && !data.pubDate && !data.date) {
    errors.push(`${prefix} Missing required field: pubDate/date`);
  }

  // Check for common SEO issues
  if (data.title && data.description && data.title === data.description) {
    warnings.push(`${prefix} Title and description are identical - this hurts SEO`);
  }

  if (data.title && data.title.toLowerCase().includes('lorem ipsum')) {
    warnings.push(`${prefix} Title contains placeholder text`);
  }

  if (data.description && data.description.toLowerCase().includes('lorem ipsum')) {
    warnings.push(`${prefix} Description contains placeholder text`);
  }

  // Draft warnings
  if (data.draft && process.env.NODE_ENV === 'production') {
    warnings.push(`${prefix} Draft content found in production build`);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Validates multiple content entries and logs results
 */
export function validateContentSEO(
  entries: any[],
  contentType: string = 'content',
  requirements?: SEOFieldRequirements
): { totalWarnings: number; totalErrors: number } {
  let totalWarnings = 0;
  let totalErrors = 0;

  console.log(`\n🔍 SEO Validation: Checking ${entries.length} ${contentType} entries...`);

  entries.forEach((entry) => {
    const slug = entry.slug || entry.id || 'unknown';
    const result = validateSEOFields(entry, slug, contentType, requirements);
    
    result.errors.forEach((error) => {
      console.error(`❌ ${error}`);
      totalErrors++;
    });

    result.warnings.forEach((warning) => {
      console.warn(`⚠️  ${warning}`);
      totalWarnings++;
    });
  });

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`✅ ${contentType}: All entries have good SEO metadata!`);
  } else {
    console.log(`📊 ${contentType} SEO Summary: ${totalErrors} errors, ${totalWarnings} warnings`);
  }

  return { totalWarnings, totalErrors };
}

/**
 * Blog-specific validation requirements
 */
export const BLOG_SEO_REQUIREMENTS: SEOFieldRequirements = {
  title: { required: true, minLength: 10, maxLength: 60 },
  description: { required: true, minLength: 50, maxLength: 160 },
  image: { required: false }, // Recommended but not required
  tags: { required: true, minCount: 2 },
  author: { required: false }, // Will default to site author
  pubDate: { required: true },
  canonical: { required: false },
};

/**
 * Project-specific validation requirements
 */
export const PROJECT_SEO_REQUIREMENTS: SEOFieldRequirements = {
  title: { required: true, minLength: 5, maxLength: 60 },
  description: { required: true, minLength: 30, maxLength: 160 },
  tags: { required: true, minCount: 1 },
  author: { required: false },
  canonical: { required: false },
};