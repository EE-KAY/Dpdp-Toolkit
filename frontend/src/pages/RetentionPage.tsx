import { useLocation, Link } from "react-router-dom";

const subtabs = [
  { label: "Retention Policies", href: "/retention" },
  { label: "Expiry Tracker", href: "/retention/expiry" },
  { label: "Auto-Purge Jobs", href: "/retention/purge" },
  { label: "Archive Vault", href: "/retention/archive" },
];

const retentionPolicies = [
  { id: "RP-01", name: "Customer PII – 24 Months", scope: "PostgreSQL Prod", retention: "24 months", action: "Auto-Purge", records: 14200, active: true },
  { id: "RP-02", name: "Transaction Logs – 36 Months", scope: "All Sources", retention: "36 months", action: "Archive", records: 120000, active: true },
  { id: "RP-03", name: "Marketing Consent – 12 Months", scope: "MongoDB Analytics", retention: "12 months", action: "Auto-Purge", records: 8420, active: true },
  { id: "RP-04", name: "Session Data – 30 Days", scope: "Redis Cache", retention: "30 days", action: "Auto-Purge", records: 450000, active: true },
  { id: "RP-05", name: "Legacy Export – Immediate", scope: "CSV Exports", retention: "0 days", action: "Auto-Purge", records: 3070, active: false },
];

const expiryTracker = [
  { id: "EXP-001", dataset: "users_pii (PostgreSQL)", field: "aadhaar_number", records: 342, expires_in: "7 days", policy: "RP-01" },
  { id: "EXP-002", dataset: "contacts (CRM)", field: "phone_number", records: 128, expires_in: "14 days", policy: "RP-01" },
  { id: "EXP-003", dataset: "marketing_consent (MongoDB)", field: "email", records: 891, expires_in: "22 days", policy: "RP-03" },
  { id: "EXP-004", dataset: "session_logs (Redis)", field: "session_data", records: 15400, expires_in: "3 days", policy: "RP-04" },
  { id: "EXP-005", dataset: "kyc_docs (PostgreSQL)", field: "pan_number", records: 56, expires_in: "30 days", policy: "RP-01" },
  { id: "EXP-006", dataset: "access_logs (S3)", field: "ip_address", records: 22000, expires_in: "28 days", policy: "RP-02" },
];

const purgeJobs = [
  { id: "PJ-045", policy: "RP-04", dataset: "session_logs (Redis)", status: "completed", purged: 12300, scheduled: "2026-03-18 12:00", duration: "0m 45s" },
  { id: "PJ-044", policy: "RP-01", dataset: "users_pii (PostgreSQL)", status: "completed", purged: 230, scheduled: "2026-03-18 00:00", duration: "2m 12s" },
  { id: "PJ-043", policy: "RP-03", dataset: "marketing_consent (MongoDB)", status: "completed", purged: 89, scheduled: "2026-03-17 00:00", duration: "1m 03s" },
  { id: "PJ-042", policy: "RP-05", dataset: "CSV Exports", status: "failed", purged: 0, scheduled: "2026-03-16 06:00", duration: "0m 08s" },
  { id: "PJ-041", policy: "RP-04", dataset: "session_logs (Redis)", status: "scheduled", purged: 0, scheduled: "2026-03-19 00:00", duration: "—" },
];

const archiveVault = [
  { id: "ARC-012", source: "Transaction Logs (2024 Q1)", records: 45000, archived: "2025-04-01", size: "2.3 GB", encrypted: true, expires: "2028-04-01" },
  { id: "ARC-011", source: "Transaction Logs (2023 Q4)", records: 38200, archived: "2025-01-01", size: "1.9 GB", encrypted: true, expires: "2028-01-01" },
  { id: "ARC-010", source: "Customer PII Snapshot (2024)", records: 14200, archived: "2025-01-15", size: "890 MB", encrypted: true, expires: "2027-01-15" },
  { id: "ARC-009", source: "Audit Logs (2024 H1)", records: 120000, archived: "2024-07-01", size: "4.1 GB", encrypted: true, expires: "2027-07-01" },
];

const purgeStatusColors: Record<string, string> = {
  completed: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
  scheduled: "bg-muted text-muted-foreground",
};

function SubtabNav() {
  const location = useLocation();
  return (
    <div className="flex gap-1 border-b border-border overflow-x-auto">
      {subtabs.map((s) => (
        <Link key={s.href} to={s.href} className={`px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors ${
          location.pathname === s.href ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
        }`}>{s.label}</Link>
      ))}
    </div>
  );
}

export default function RetentionPage() {
  const path = useLocation().pathname;
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Retention</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Retention policies, expiry tracking, and auto-purge jobs</p>
      </div>
      <SubtabNav />

      {path === "/retention" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Policy Name", "Scope", "Retention", "Action", "Records", "Active"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {retentionPolicies.map(p => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{p.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{p.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.scope}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.retention}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.action}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{p.records.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${p.active ? "bg-primary" : "bg-muted-foreground"}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/retention/expiry" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">Data Expiring Within 30 Days</h2>
            <span className="font-mono-data text-[11px] text-warning">{expiryTracker.reduce((s, e) => s + e.records, 0).toLocaleString()} RECORDS</span>
          </div>
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Dataset", "Field", "Records", "Expires In", "Policy"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {expiryTracker.map(e => (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{e.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{e.dataset}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{e.field}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{e.records.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${
                    parseInt(e.expires_in) <= 7 ? "bg-destructive/10 text-destructive" :
                    parseInt(e.expires_in) <= 14 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                  }`}>{e.expires_in}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-primary">{e.policy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/retention/purge" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Job ID", "Policy", "Dataset", "Status", "Purged", "Scheduled", "Duration"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {purgeJobs.map(j => (
                <tr key={j.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{j.id}</td>
                  <td className="px-4 py-2.5 font-mono-data text-primary">{j.policy}</td>
                  <td className="px-4 py-2.5 text-foreground">{j.dataset}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${purgeStatusColors[j.status]}`}>{j.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{j.purged.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{j.scheduled}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{j.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/retention/archive" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Source", "Records", "Archived", "Size", "Encrypted", "Expires"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {archiveVault.map(a => (
                <tr key={a.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{a.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{a.source}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{a.records.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{a.archived}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{a.size}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${a.encrypted ? "bg-primary" : "bg-destructive"}`} /></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{a.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
