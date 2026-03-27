import { useState } from "react";

const mockDBSources = [
  {
    id: "db-1",
    name: "PostgreSQL Production",
    host: "pg-prod.internal:5432",
    tables: 142,
    rows: "12.4M",
    pii_fields: 38,
    status: "connected",
  },
  {
    id: "db-2",
    name: "MySQL CRM",
    host: "mysql-crm.internal:3306",
    tables: 67,
    rows: "3.2M",
    pii_fields: 22,
    status: "connected",
  },
  {
    id: "db-3",
    name: "MongoDB Analytics",
    host: "mongo-analytics.internal:27017",
    tables: 34,
    rows: "8.1M",
    pii_fields: 15,
    status: "disconnected",
  },
  {
    id: "db-4",
    name: "Redis Cache",
    host: "redis.internal:6379",
    tables: 0,
    rows: "—",
    pii_fields: 0,
    status: "connected",
  },
  {
    id: "db-5",
    name: "Oracle Legacy",
    host: "oracle-legacy.internal:1521",
    tables: 210,
    rows: "45.8M",
    pii_fields: 94,
    status: "error",
  },
];

const mockTables = [
  {
    name: "users",
    rows: 124000,
    pii_fields: ["email", "phone", "aadhaar_number"],
    risk: "critical",
  },
  {
    name: "orders",
    rows: 890000,
    pii_fields: ["shipping_address"],
    risk: "medium",
  },
  {
    name: "kyc_documents",
    rows: 45000,
    pii_fields: ["pan_number", "aadhaar_number", "photo_id"],
    risk: "critical",
  },
  {
    name: "payments",
    rows: 234000,
    pii_fields: ["bank_account", "upi_id"],
    risk: "high",
  },
  {
    name: "sessions",
    rows: 1200000,
    pii_fields: ["ip_address", "user_agent"],
    risk: "low",
  },
  { name: "audit_trail", rows: 3400000, pii_fields: [], risk: "low" },
  {
    name: "notifications",
    rows: 560000,
    pii_fields: ["email", "phone"],
    risk: "medium",
  },
];

const riskColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-warning/10 text-warning",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

export default function DatabasePanel() {
  const [selectedDB, setSelectedDB] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-[13px] font-semibold text-foreground">
            Database Connections
          </h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Source
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Host
              </th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Tables
              </th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Rows
              </th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                PII Fields
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockDBSources.map((db) => (
              <tr
                key={db.id}
                className={`hover:bg-muted/20 cursor-pointer ${selectedDB === db.id ? "bg-primary/5" : ""}`}
                onClick={() =>
                  setSelectedDB(selectedDB === db.id ? null : db.id)
                }
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {db.name}
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                  {db.host}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-foreground">
                  {db.tables}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-foreground">
                  {db.rows}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-foreground">
                  {db.pii_fields}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
                      db.status === "connected"
                        ? "bg-primary"
                        : db.status === "error"
                          ? "bg-destructive"
                          : "bg-muted-foreground"
                    }`}
                  />
                  <span className="text-muted-foreground capitalize text-[12px]">
                    {db.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDB && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-[13px] font-semibold text-foreground">
              Tables — {mockDBSources.find((d) => d.id === selectedDB)?.name}
            </h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  Table
                </th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  Rows
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  PII Fields
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockTables.map((t) => (
                <tr key={t.name} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono font-medium text-foreground">
                    {t.name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-foreground">
                    {t.rows.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {t.pii_fields.length > 0 ? (
                        t.pii_fields.map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.5 text-[10px] bg-warning/10 text-warning rounded-sm"
                          >
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${riskColors[t.risk]}`}
                    >
                      {t.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
