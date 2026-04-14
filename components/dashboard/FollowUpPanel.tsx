import {
  categorizeFollowUps,
  formatDateDE,
  getPriorityBadgeClass,
  type LeadItem,
} from "@/utils/followupUtils"

function Section({
  title,
  count,
  items,
  emptyText,
}: {
  title: string
  count: number
  items: LeadItem[]
  emptyText: string
}) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((lead) => (
            <div
              key={lead.id}
              className="grid grid-cols-5 gap-3 items-center border rounded px-3 py-2 text-sm"
            >
              <div className="font-medium truncate">{lead.name || "—"}</div>
              <div className="truncate">{lead.requested_package || "-"}</div>
              <div>{formatDateDE(lead.follow_up_at)}</div>
              <div>{lead.lead_type || "-"}</div>
              <div className="flex justify-end">
                <span
                  className={`text-xs px-2 py-1 rounded ${getPriorityBadgeClass(
                    lead.priority
                  )}`}
                >
                  {lead.priority || "none"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FollowUpPanel({ leads }: { leads: LeadItem[] }) {
  const { today, overdue, upcoming } = categorizeFollowUps(leads || [])

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-orange-400">
          <h3 className="text-sm text-gray-500">Heute fällig</h3>
          <p className="text-2xl font-bold">{today.length}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
          <h3 className="text-sm text-gray-500">Überfällig</h3>
          <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-sm text-gray-500">Nächste 3 Tage</h3>
          <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section
          title="Überfällig"
          count={overdue.length}
          items={overdue}
          emptyText="Keine überfälligen Follow-ups"
        />

        <Section
          title="Heute fällig"
          count={today.length}
          items={today}
          emptyText="Heute keine Follow-ups"
        />

        <Section
          title="Nächste 3 Tage"
          count={upcoming.length}
          items={upcoming}
          emptyText="Keine anstehenden Follow-ups"
        />
      </div>
    </div>
  )
}
