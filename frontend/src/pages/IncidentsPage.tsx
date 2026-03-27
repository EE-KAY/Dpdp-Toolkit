import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { fetchIncidents } from "@/api/mock";
import type { Incident } from "@/api/types";

const subtabs = [
  { label: "Active Incidents", href: "/incidents" },
  { label: "Breach Analyzer", href: "/incidents/analyzer" },
  { label: "Impacted Users", href: "/incidents/users" },
  { label: "Notifications", href: "/incidents/notifications" },
  { label: "SIEM Integrations", href: "/incidents/siem" },
];

const severityColors: Record<string, string> = { critical: "bg-destructive/10 text-destructive", high: "bg-warning/10 text-warning", medium: "bg-primary/10 text-primary", low: "bg-muted text-muted-foreground" };
const incStatusColors: Record<string, string> = { active: "bg-destructive", contained: "bg-warning", resolved: "bg-primary" };

const breachTimeline = [
  { time: "2026-03-18 14:00:00", event: "Anomalous query pattern detected on DB-04", severity: "warning" },
  { time: "2026-03-18 14:02:12", event: "Alert triggered: 500+ records accessed in <30s", severity: "critical" },
  { time: "2026-03-18 14:03:45", event: "Source IP identified: 103.22.xx.xx (external)", severity: "info" },
  { time: "2026-03-18 14:05:00", event: "Automated containment: DB-04 read access revoked", severity: "success" },
  { time: "2026-03-18 14:10:22", event: "Forensic snapshot captured for DB-04", severity: "info" },
  { time: "2026-03-18 14:15:00", event: "DPO notified via email and SMS", severity: "info" },
  { time: "2026-03-18 14:30:00", event: "Breach report auto-generated (DPDP Section 8)", severity: "success" },
];

const impactedUsers = [
  { id: "USR-4521", email: "user1@example.com", data_exposed: ["Aadhaar", "Email"], incident: "INC-101", notified: true, remediation: "Password Reset" },
  { id: "USR-4522", email: "user2@example.com", data_exposed: ["Email", "Phone"], incident: "INC-101", notified: true, remediation: "Account Lock" },
  { id: "USR-4523", email: "admin@corp.in", data_exposed: ["Aadhaar", "PAN"], incident: "INC-101", notified: false, remediation: "Pending" },
  { id: "USR-8891", email: "hr@company.in", data_exposed: ["Email"], incident: "INC-099", notified: true, remediation: "None Required" },
  { id: "USR-8892", email: "legal@firm.co.in", data_exposed: ["Phone", "Address"], incident: "INC-099", notified: true, remediation: "None Required" },
];

const notifications = [
  { id: "NOT-201", type: "Breach Alert", recipient: "dpo@corp.in", channel: "Email + SMS", sent: "2026-03-18 14:15:00", status: "delivered", incident: "INC-101" },
  { id: "NOT-200", type: "Breach Alert", recipient: "ciso@corp.in", channel: "Email", sent: "2026-03-18 14:15:02", status: "delivered", incident: "INC-101" },
  { id: "NOT-199", type: "User Notification", recipient: "user1@example.com", channel: "Email", sent: "2026-03-18 14:30:00", status: "delivered", incident: "INC-101" },
  { id: "NOT-198", type: "Regulator Filing", recipient: "dpb@gov.in", channel: "API", sent: "2026-03-18 14:45:00", status: "pending", incident: "INC-100" },
  { id: "NOT-197", type: "User Notification", recipient: "user2@example.com", channel: "Email", sent: "2026-03-18 14:30:05", status: "bounced", incident: "INC-101" },
];

const siemIntegrations = [
  { id: "SIEM-01", name: "Splunk Enterprise", status: "connected", events_sent: 12400, last_sync: "2m ago", endpoint: "https://splunk.corp.in:8088/services/collector" },
  { id: "SIEM-02", name: "Elastic SIEM", status: "connected", events_sent: 12400, last_sync: "2m ago", endpoint: "https://elastic.corp.in:9200/_bulk" },
  { id: "SIEM-03", name: "IBM QRadar", status: "disconnected", events_sent: 0, last_sync: "—", endpoint: "https://qradar.corp.in/api/ariel" },
  { id: "SIEM-04", name: "Microsoft Sentinel", status: "connected", events_sent: 8900, last_sync: "5m ago", endpoint: "https://sentinel.azure.com/api/ingest" },
];

const timelineColors: Record<string, string> = { warning: "bg-warning", critical: "bg-destructive", info: "bg-muted-foreground", success: "bg-primary" };
const notifStatusColors: Record<string, string> = { delivered: "bg-primary/10 text-primary", pending: "bg-warning/10 text-warning", bounced: "bg-destructive/10 text-destructive" };

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

export default function IncidentsPage() {
  const path = useLocation().pathname;
  const [incidents, setIncidents] = useState<Incident[]>([]);
  useEffect(() => { fetchIncidents().then(setIncidents); }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Incidents</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Active incidents, breach analysis, and SIEM integrations</p>
      </div>
      <SubtabNav />

      {path === "/incidents" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Title", "Severity", "Status", "Affected", "Detected"].map(h => (
                <th key={h} className={`${h === "Affected" ? "text-right" : "text-left"} px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider`}>{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {incidents.map(i => (
                <tr key={i.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{i.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{i.title}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${severityColors[i.severity]}`}>{i.severity}</span></td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${incStatusColors[i.status]}`} /><span className="text-muted-foreground capitalize">{i.status}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{i.affected_users.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{i.detected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/incidents/analyzer" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow">
          <div className="px-4 py-3 border-b border-border"><h2 className="text-[13px] font-semibold text-foreground">Breach Timeline — INC-101</h2></div>
          <div className="p-4 space-y-0">
            {breachTimeline.map((t, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${timelineColors[t.severity]}`} />
                  {i < breachTimeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-2">
                  <p className="text-[13px] text-foreground">{t.event}</p>
                  <p className="text-[11px] font-mono-data text-muted-foreground mt-0.5">{t.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {path === "/incidents/users" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["User ID", "Email", "Data Exposed", "Incident", "Notified", "Remediation"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {impactedUsers.map(u => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{u.id}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{u.email}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground text-[12px]">{u.data_exposed.join(", ")}</td>
                  <td className="px-4 py-2.5 font-mono-data text-primary">{u.incident}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${u.notified ? "bg-primary" : "bg-warning"}`} /></td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${
                    u.remediation === "Pending" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  }`}>{u.remediation}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/incidents/notifications" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Type", "Recipient", "Channel", "Sent", "Status", "Incident"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {notifications.map(n => (
                <tr key={n.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{n.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{n.type}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{n.recipient}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{n.channel}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{n.sent}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${notifStatusColors[n.status]}`}>{n.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-primary">{n.incident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/incidents/siem" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Platform", "Status", "Events Sent", "Last Sync", "Endpoint"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {siemIntegrations.map(s => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{s.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${s.status === "connected" ? "bg-primary" : "bg-destructive"}`} /><span className="text-muted-foreground capitalize">{s.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{s.events_sent.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{s.last_sync}</td>
                  <td className="px-4 py-2.5 font-mono-data text-[12px] text-muted-foreground max-w-xs truncate">{s.endpoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
