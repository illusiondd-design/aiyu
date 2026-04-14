export type Company = {
  cta?: string
  id: string;
  name: string;
  industry: string;
  package: "starter" | "avant" | "proship";
  billingMode: "demo" | "paid";
  trialLimit: number;
};

export const companies: Company[] = [
  {
    id: "rob-kfz",
    name: "Robs KFZ",
    industry: "kfz_werkstatt",
    package: "starter",
    billingMode: "demo",
    trialLimit: 3,
  },
];

export function getCompanyById(companyId: string): Company {
  return companies.find((company) => company.id === companyId) ?? companies[0];
}
