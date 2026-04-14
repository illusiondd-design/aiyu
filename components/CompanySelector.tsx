"use client";

import { useEffect, useState } from "react";
import { companies } from "@/data/companies";
import { storageService } from "@/services/storageService";

export default function CompanySelector() {
  const [selectedCompany, setSelectedCompany] = useState("robs_kfz");

  useEffect(() => {
    const saved = storageService.getSelectedCompany();
    setSelectedCompany(saved);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCompany(value);
    storageService.setSelectedCompany(value);
  };

  return (
    <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Mandant wählen
      </label>

      <select
        value={selectedCompany}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-gray-500"
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}
