/**
 * Draft Management System
 * Handles saving, loading, and managing form drafts in localStorage
 */

interface Draft {
  id: string;
  formName: string;
  data: Record<string, any>;
  currentStep: number;
  savedAt: string;
  expiresAt: string;
}

const DRAFT_PREFIX = 'form_draft_';
const DRAFT_EXPIRY_DAYS = 7; // Drafts expire after 7 days

/**
 * Get all saved drafts
 */
export const getAllDrafts = (): Draft[] => {
  if (typeof window === 'undefined') return [];

  const drafts: Draft[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DRAFT_PREFIX)) {
      try {
        const draft = JSON.parse(localStorage.getItem(key) || '');
        // Check if draft has expired
        if (new Date(draft.expiresAt) > new Date()) {
          drafts.push(draft);
        } else {
          // Remove expired draft
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Error parsing draft:', error);
      }
    }
  }
  return drafts;
};

/**
 * Get a specific draft by form name
 */
export const getDraft = (formName: string): Draft | null => {
  if (typeof window === 'undefined') return null;

  const key = `${DRAFT_PREFIX}${formName}`;
  try {
    const draft = JSON.parse(localStorage.getItem(key) || 'null');
    if (draft && new Date(draft.expiresAt) > new Date()) {
      return draft;
    } else if (draft) {
      // Remove expired draft
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error retrieving draft:', error);
  }
  return null;
};

/**
 * Save a draft
 */
export const saveDraft = (
  formName: string,
  data: Record<string, any>,
  currentStep: number = 0
): void => {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const draft: Draft = {
    id: `${formName}_${Date.now()}`,
    formName,
    data,
    currentStep,
    savedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  try {
    localStorage.setItem(`${DRAFT_PREFIX}${formName}`, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

/**
 * Delete a specific draft
 */
export const deleteDraft = (formName: string): void => {
  if (typeof window === 'undefined') return;

  const key = `${DRAFT_PREFIX}${formName}`;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting draft:', error);
  }
};

/**
 * Delete all drafts
 */
export const deleteAllDrafts = (): void => {
  if (typeof window === 'undefined') return;

  const keysToDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DRAFT_PREFIX)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  });
};

/**
 * Get formatted date from draft
 */
export const getFormattedDraftDate = (draft: Draft): string => {
  const date = new Date(draft.savedAt);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
