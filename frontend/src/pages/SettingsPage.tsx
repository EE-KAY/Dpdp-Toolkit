import { useLocation, Link } from "react-router-dom";

const subtabs = [
  { label: "Users & Roles", href: "/settings" },
  { label: "API Keys", href: "/settings/api-keys" },
  { label: "Security Settings", href: "/settings/security" },
  { label: "Integrations", href: "/settings/integrations" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Organization Profile", href: "/settings/organization" },
];

const users = [
  { id: "USR-001", email: "admin@dpdp.gov.in", name: "Rajesh Kumar", role: "Admin", status: "active", last_login: "2m ago", mfa: true },
  { id: "USR-002", email: "dpo@corp.in", name: "Priya Sharma", role: "DPO", status: "active", last_login: "1h ago", mfa: true },
  { id: "USR-003", email: "legal@corp.in", name: "Anil Verma", role: "Legal Counsel", status: "active", last_login: "3h ago", mfa: true },
  { id: "USR-004", email: "infra@corp.in", name: "Deepak Singh", role: "Infra Engineer", status: "active", last_login: "30m ago", mfa: false },
  { id: "USR-005", email: "auditor@ext.com", name: "Meera Patel", role: "Auditor (External)", status: "inactive", last_login: "15d ago", mfa: true },
];

const apiKeys = [
  { id: "KEY-001", name: "Production Scanner", key: "dpdp_prod_sk_...a8f2", scope: "read:scan, write:scan", created: "2026-01-15", last_used: "2m ago", status: "active" },
  { id: "KEY-002", name: "Consent API", key: "dpdp_prod_sk_...b3d9", scope: "read:consent, write:consent", created: "2026-02-01", last_used: "15m ago", status: "active" },
  { id: "KEY-003", name: "Audit Export", key: "dpdp_prod_sk_...c7f1", scope: "read:audit", created: "2025-11-20", last_used: "1d ago", status: "active" },
  { id: "KEY-004", name: "Legacy Integration", key: "dpdp_prod_sk_...d2a5", scope: "read:all", created: "2025-06-01", last_used: "30d ago", status: "revoked" },
];

const securitySettings = [
  { setting: "Multi-Factor Authentication (MFA)", value: "Required for all users", status: "enforced" },
  { setting: "Session Timeout", value: "30 minutes", status: "active" },
  { setting: "IP Allowlisting", value: "10.0.0.0/8, 192.168.0.0/16, 103.22.xx.0/24", status: "active" },
  { setting: "Password Policy", value: "Min 12 chars, uppercase, number, special", status: "enforced" },
  { setting: "Audit Log Retention", value: "7 years (immutable)", status: "enforced" },
  { setting: "Data Encryption at Rest", value: "AES-256-GCM", status: "enforced" },
  { setting: "TLS Version", value: "1.3 only", status: "enforced" },
  { setting: "Rate Limiting", value: "1000 req/min per API key", status: "active" },
];

const integrations = [
  { id: "INT-01", name: "Splunk SIEM", type: "SIEM", status: "connected", events: "12,400/day", configured: "2026-01-10" },
  { id: "INT-02", name: "Elastic SIEM", type: "SIEM", status: "connected", events: "12,400/day", configured: "2026-01-10" },
  { id: "INT-03", name: "Symantec DLP", type: "DLP", status: "connected", events: "3,200/day", configured: "2026-02-15" },
  { id: "INT-04", name: "Salesforce CRM", type: "CRM", status: "connected", events: "450/day", configured: "2025-11-01" },
  { id: "INT-05", name: "ServiceNow ITSM", type: "ITSM", status: "disconnected", events: "—", configured: "—" },
];

const notifSettings = [
  { channel: "Email", recipient: "dpo@corp.in", triggers: "Breach, DSR SLA, Compliance Drop", enabled: true },
  { channel: "SMS", recipient: "+91-XXXX-XXX-890", triggers: "Critical Breach Only", enabled: true },
  { channel: "Slack", recipient: "#dpdp-alerts", triggers: "All Alerts", enabled: true },
  { channel: "Webhook", recipient: "https://hooks.corp.in/dpdp", triggers: "Breach, Scan Failure", enabled: false },
  { channel: "PagerDuty", recipient: "DPDP On-Call", triggers: "Critical Breach, System Down", enabled: true },
];

const orgProfile = {
  name: "DPDP Command Center",
  legal_entity: "Digital Data Protection Authority of India",
  registration: "DPDP-REG-2025-KA-001",
  region: "India – South (KA-01)",
  dpo: "Priya Sharma (dpo@corp.in)",
  data_centers: ["Bangalore DC-1", "Bangalore DC-2", "Mumbai DC-1", "Delhi DC-1"],
  compliance_frameworks: ["DPDP Act 2023", "ISO 27001:2022", "SOC 2 Type II", "CERT-In Guidelines"],
  established: "2025-08-15",
};

const roleColors: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  DPO: "bg-warning/10 text-warning",
  "Legal Counsel": "bg-muted text-muted-foreground",
  "Infra Engineer": "bg-muted text-muted-foreground",
  "Auditor (External)": "bg-muted text-muted-foreground",
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

export default function SettingsPage() {
  const path = useLocation().pathname;
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Platform configuration, access control, and integrations</p>
      </div>
      <SubtabNav />

      {path === "/settings" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Name", "Email", "Role", "Status", "Last Login", "MFA"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{u.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${roleColors[u.role] || "bg-muted text-muted-foreground"}`}>{u.role}</span></td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${u.status === "active" ? "bg-primary" : "bg-muted-foreground"}`} /><span className="text-muted-foreground capitalize">{u.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{u.last_login}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${u.mfa ? "bg-primary" : "bg-destructive"}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/settings/api-keys" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Name", "Key", "Scope", "Created", "Last Used", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {apiKeys.map(k => (
                <tr key={k.id} className={`hover:bg-muted/20 ${k.status === "revoked" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{k.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{k.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground text-[12px]">{k.key}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground text-[12px]">{k.scope}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{k.created}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{k.last_used}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${k.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{k.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/settings/security" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow">
          <div className="divide-y divide-border">
            {securitySettings.map((s, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{s.setting}</p>
                  <p className="text-[12px] font-mono-data text-muted-foreground mt-0.5">{s.value}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-sm uppercase ${
                  s.status === "enforced" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {path === "/settings/integrations" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Platform", "Type", "Status", "Events/Day", "Configured"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {integrations.map(i => (
                <tr key={i.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{i.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{i.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i.type}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${i.status === "connected" ? "bg-primary" : "bg-destructive"}`} /><span className="text-muted-foreground capitalize">{i.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{i.events}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{i.configured}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/settings/notifications" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow">
          <div className="divide-y divide-border">
            {notifSettings.map((n, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/20">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.enabled ? "bg-primary" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{n.channel}</p>
                  <p className="text-[12px] font-mono-data text-muted-foreground mt-0.5">{n.recipient}</p>
                </div>
                <p className="text-[12px] text-muted-foreground shrink-0 max-w-xs truncate">{n.triggers}</p>
                <span className={`text-[11px] font-medium uppercase shrink-0 ${n.enabled ? "text-primary" : "text-muted-foreground"}`}>
                  {n.enabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {path === "/settings/organization" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow">
          <div className="divide-y divide-border">
            {Object.entries(orgProfile).map(([key, value]) => (
              <div key={key} className="px-4 py-3 flex items-start gap-4 hover:bg-muted/20">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium w-48 shrink-0 pt-0.5">{key.replace(/_/g, " ")}</span>
                <span className="text-[13px] text-foreground font-mono-data">{Array.isArray(value) ? value.join(" · ") : value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
