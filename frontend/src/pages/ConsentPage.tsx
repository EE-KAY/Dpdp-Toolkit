import { useLocation, Link } from "react-router-dom";

const subtabs = [
  { label: "Consent Ledger", href: "/consent" },
  { label: "Purpose Management", href: "/consent/purposes" },
  { label: "Consent Policies", href: "/consent/policies" },
  { label: "API Access Logs", href: "/consent/api-logs" },
];

const ledger = [
  { id: "CON-8812", user: "user@example.com", purpose: "Marketing", status: "revoked", given: "2025-11-01", revoked: "2026-03-18 13:45", method: "API" },
  { id: "CON-8811", user: "admin@corp.in", purpose: "Analytics", status: "active", given: "2025-09-15", revoked: "—", method: "Portal" },
  { id: "CON-8810", user: "legal@firm.co.in", purpose: "Service Delivery", status: "active", given: "2025-08-22", revoked: "—", method: "Portal" },
  { id: "CON-8809", user: "hr@company.in", purpose: "Marketing", status: "expired", given: "2024-12-01", revoked: "—", method: "Email" },
  { id: "CON-8808", user: "dev@startup.io", purpose: "Research", status: "active", given: "2026-01-10", revoked: "—", method: "API" },
  { id: "CON-8807", user: "support@vendor.com", purpose: "Service Delivery", status: "revoked", given: "2025-06-15", revoked: "2026-02-28", method: "Portal" },
];

const purposes = [
  { id: "PUR-01", name: "Service Delivery", description: "Core product functionality", users_consented: 14200, retention: "Account lifetime", legal_basis: "Contract" },
  { id: "PUR-02", name: "Marketing", description: "Promotional communications", users_consented: 8420, retention: "12 months", legal_basis: "Consent" },
  { id: "PUR-03", name: "Analytics", description: "Product improvement analytics", users_consented: 11800, retention: "24 months", legal_basis: "Legitimate Interest" },
  { id: "PUR-04", name: "Research", description: "Academic and internal research", users_consented: 3200, retention: "36 months", legal_basis: "Consent" },
  { id: "PUR-05", name: "Third-Party Sharing", description: "Data shared with partners", users_consented: 2100, retention: "6 months", legal_basis: "Consent" },
];

const policies = [
  { id: "CP-01", name: "Default Consent Policy", version: "v3.2", purposes: ["Service Delivery", "Analytics"], auto_expire: "12 months", active: true, last_updated: "2026-03-01" },
  { id: "CP-02", name: "Marketing Opt-In", version: "v2.1", purposes: ["Marketing"], auto_expire: "6 months", active: true, last_updated: "2026-02-15" },
  { id: "CP-03", name: "Research Consent", version: "v1.0", purposes: ["Research"], auto_expire: "24 months", active: true, last_updated: "2026-01-20" },
  { id: "CP-04", name: "Legacy Policy (Deprecated)", version: "v1.0", purposes: ["Service Delivery", "Marketing", "Analytics"], auto_expire: "—", active: false, last_updated: "2024-06-01" },
];

const apiLogs = [
  { id: "API-991", endpoint: "POST /consent/grant", user: "dev@startup.io", purpose: "Research", result: "200 OK", time: "2026-03-18 14:28:01", ip: "103.22.xx.xx" },
  { id: "API-990", endpoint: "DELETE /consent/revoke", user: "user@example.com", purpose: "Marketing", result: "200 OK", time: "2026-03-18 13:45:22", ip: "49.207.xx.xx" },
  { id: "API-989", endpoint: "GET /consent/status", user: "admin@corp.in", purpose: "Analytics", result: "200 OK", time: "2026-03-18 12:10:05", ip: "10.0.xx.xx" },
  { id: "API-988", endpoint: "POST /consent/grant", user: "hr@company.in", purpose: "Marketing", result: "403 Forbidden", time: "2026-03-18 11:55:00", ip: "192.168.xx.xx" },
  { id: "API-987", endpoint: "GET /consent/audit", user: "legal@firm.co.in", purpose: "—", result: "200 OK", time: "2026-03-18 10:30:44", ip: "10.0.xx.xx" },
];

const consentStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  revoked: "bg-destructive/10 text-destructive",
  expired: "bg-warning/10 text-warning",
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

export default function ConsentPage() {
  const path = useLocation().pathname;
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Consent Management</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Consent ledger, purpose management, and enforcement logs</p>
      </div>
      <SubtabNav />

      {path === "/consent" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "User", "Purpose", "Status", "Given", "Revoked", "Method"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {ledger.map(l => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{l.id}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{l.user}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.purpose}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${consentStatusColors[l.status]}`}>{l.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.given}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.revoked}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/consent/purposes" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Purpose", "Description", "Users Consented", "Retention", "Legal Basis"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {purposes.map(p => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.description}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{p.users_consented.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.retention}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.legal_basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/consent/policies" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Policy Name", "Version", "Purposes", "Auto-Expire", "Active", "Updated"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {policies.map(p => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.version}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-[12px]">{p.purposes.join(", ")}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.auto_expire}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${p.active ? "bg-primary" : "bg-muted-foreground"}`} /></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{p.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/consent/api-logs" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Log ID", "Endpoint", "User", "Purpose", "Result", "Timestamp", "IP"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {apiLogs.map(l => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground text-[12px]">{l.endpoint}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.user}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.purpose}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${l.result.includes("200") ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{l.result}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{l.time}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
