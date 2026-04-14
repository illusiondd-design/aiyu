const STORAGE_KEYS = {
  contentDraft: "postmeister:contentDraft",
};

export type ContentDraft = {
  rawInput: string;
  platforms: string[];
  mediaName?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export const draftService = {
  getDraft(): ContentDraft {
    if (!isBrowser()) {
      return {
        rawInput: "",
        platforms: ["instagram", "tiktok"],
        mediaName: "",
      };
    }

    const raw = window.localStorage.getItem(STORAGE_KEYS.contentDraft);

    if (!raw) {
      return {
        rawInput: "",
        platforms: ["instagram", "tiktok"],
        mediaName: "",
      };
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {
        rawInput: "",
        platforms: ["instagram", "tiktok"],
        mediaName: "",
      };
    }
  },

  saveDraft(draft: ContentDraft) {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.contentDraft, JSON.stringify(draft));
  },

  clearDraft() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEYS.contentDraft);
  },
};
