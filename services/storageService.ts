const STORAGE_KEYS = {
  selectedCompany: "postmeister:selectedCompany",
};

function isBrowser() {
  return typeof window !== "undefined";
}

export const storageService = {
  getSelectedCompany(): string {
    if (!isBrowser()) return "robs_kfz";
    return window.localStorage.getItem(STORAGE_KEYS.selectedCompany) || "robs_kfz";
  },

  setSelectedCompany(companyId: string) {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.selectedCompany, companyId);
  },
};
