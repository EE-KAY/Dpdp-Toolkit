import { useLocation, Link } from "react-router-dom";

const subtabs = [
  { label: "Masking Policies", href: "/protection" },
  { label: "Anonymization Jobs", href: "/protection/anonymization" },
  { label: "Tokenization Vault", href: "/protection/tokenization" },
  { label: "Transformation Logs", href: "/protection/logs" },
];

const maskingPolicies = [
  { id: "MP-04", name: "Aadhaar Full Mask", target: "aadhaar_number", method: "SHA-256 Hash", scope: "PostgreSQL Prod", status: "active", applied: "2026-03-18 14:32" },
  { id: "MP-03", name: "PAN Partial Mask", target: "pan_number", method: "Partial (last 4)", scope: "All Sources", status: "active", applied: "2026-03-15 09:00" },
  { id: "MP-02", name: "Email Domain Only", target: "email", method: "Domain Preserve", scope: "MongoDB Analytics", status: "draft", applied: "—" },
  { id: "MP-01", name: "Phone Redact", target: "phone_number", method: "Full Redact", scope: "CSV Exports", status: "active", applied: "2026-03-10 11:22" },
];

const anonJobs = [
  { id: "ANON-012", dataset: "users_pii (PostgreSQL)", technique: "k-Anonymity (k=5)", status: "completed", rows: 12400, started: "2026-03-18 10:00", duration: "8m 14s" },
  { id: "ANON-011", dataset: "access_logs (S3)", technique: "Differential Privacy (ε=1.0)", status: "completed", rows: 120000, started: "2026-03-17 22:00", duration: "45m 02s" },
  { id: "ANON-010", dataset: "kyc_docs (PostgreSQL)", technique: "l-Diversity (l=3)", status: "running", rows: 8920, started: "2026-03-18 14:10", duration: "—" },
  { id: "ANON-009", dataset: "contacts (CRM)", technique: "Generalization", status: "failed", rows: 0, started: "2026-03-16 08:00", duration: "0m 42s" },
];

const tokens = [
  { id: "TKN-4521", original_type: "Aadhaar", token: "tk_a8f2c91d...e4b7", created: "2026-03-18 14:32", reversible: true, access_count: 3 },
  { id: "TKN-4520", original_type: "PAN", token: "tk_b3d9e7a2...f1c8", created: "2026-03-18 14:15", reversible: true, access_count: 1 },
  { id: "TKN-4519", original_type: "Bank Account", token: "tk_c7f1b4d8...a2e9", created: "2026-03-17 09:30", reversible: false, access_count: 0 },
  { id: "TKN-4518", original_type: "Email", token: "tk_d2a5c8f3...b6d1", created: "2026-03-16 16:45", reversible: true, access_count: 7 },
  { id: "TKN-4517", original_type: "Phone", token: "tk_e9b3d6a1...c4f2", created: "2026-03-15 11:20", reversible: false, access_count: 2 },
];

const transformLogs = [
  { id: "TL-220", policy: "MP-04", action: "MASK_APPLIED", source: "PostgreSQL Prod → users_pii.aadhaar_number", rows: 12400, time: "2026-03-18 14:32:01", user: "admin@dpdp.gov.in" },
  { id: "TL-219", policy: "MP-03", action: "MASK_APPLIED", source: "All Sources → *.pan_number", rows: 8920, time: "2026-03-15 09:00:44", user: "system" },
  { id: "TL-218", policy: "ANON-012", action: "ANONYMIZE", source: "PostgreSQL Prod → users_pii", rows: 12400, time: "2026-03-18 10:08:14", user: "scheduler" },
  { id: "TL-217", policy: "TKN-4521", action: "TOKENIZE", source: "PostgreSQL Prod → users_pii.aadhaar_number", rows: 12400, time: "2026-03-18 14:32:05", user: "admin@dpdp.gov.in" },
  { id: "TL-216", policy: "MP-01", action: "MASK_APPLIED", source: "CSV Exports → *.phone_number", rows: 3070, time: "2026-03-10 11:22:33", user: "system" },
];

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-primary/10 text-primary",
  running: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
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

export default function DataProtectionPage() {
  const path = useLocation().pathname;
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Data Protection</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Masking, anonymization, and tokenization controls</p>
      </div>
      <SubtabNav />

      {path === "/protection" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Policy Name", "Target Field", "Method", "Scope", "Status", "Applied"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {maskingPolicies.map(p => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{p.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{p.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.target}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.method}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.scope}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${statusColors[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.applied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/protection/anonymization" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Job ID", "Dataset", "Technique", "Status", "Rows", "Started", "Duration"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {anonJobs.map(j => (
                <tr key={j.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{j.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{j.dataset}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{j.technique}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${statusColors[j.status]}`}>{j.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{j.rows.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{j.started}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{j.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/protection/tokenization" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Token ID", "Original Type", "Token Value", "Created", "Reversible", "Access Count"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {tokens.map(t => (
                <tr key={t.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{t.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{t.original_type}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground text-[12px]">{t.token}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{t.created}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${t.reversible ? "bg-primary" : "bg-destructive"}`} /></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{t.access_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/protection/logs" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Log ID", "Policy", "Action", "Source", "Rows", "Timestamp", "User"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {transformLogs.map(l => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{l.policy}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.action}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-[12px] max-w-xs truncate">{l.source}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{l.rows.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{l.time}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
