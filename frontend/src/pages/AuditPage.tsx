import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { fetchAuditLogs } from "@/api/mock";
import type { AuditLog } from "@/api/types";

const subtabs = [
  { label: "Audit Logs", href: "/audit" },
  { label: "Compliance Reports", href: "/audit/reports" },
  { label: "Regulator Exports", href: "/audit/exports" },
  { label: "Forensic Timeline", href: "/audit/timeline" },
];

const complianceReports = [
  { id: "RPT-024", title: "Monthly DPDP Compliance Summary – Mar 2026", type: "Compliance", generated: "2026-03-01", pages: 24, format: "PDF", status: "final" },
  { id: "RPT-023", title: "Quarterly Risk Assessment – Q1 2026", type: "Risk", generated: "2026-03-15", pages: 42, format: "PDF", status: "draft" },
  { id: "RPT-022", title: "Annual Data Protection Report – 2025", type: "Annual", generated: "2026-01-15", pages: 86, format: "PDF + Excel", status: "final" },
  { id: "RPT-021", title: "Incident Response Report – INC-099", type: "Incident", generated: "2026-03-05", pages: 12, format: "PDF", status: "final" },
  { id: "RPT-020", title: "Vendor Risk Assessment – Q4 2025", type: "Vendor", generated: "2025-12-28", pages: 18, format: "Excel", status: "final" },
];

const regulatorExports = [
  { id: "EXP-008", destination: "Data Protection Board (DPB)", type: "Breach Notification", reference: "INC-101", exported: "2026-03-18 14:45", status: "submitted", format: "DPDP-XML" },
  { id: "EXP-007", destination: "Data Protection Board (DPB)", type: "Annual Filing", reference: "FY-2025", exported: "2026-01-31", status: "acknowledged", format: "DPDP-XML" },
  { id: "EXP-006", destination: "CERT-In", type: "Incident Report", reference: "INC-099", exported: "2026-03-06", status: "acknowledged", format: "CERT-JSON" },
  { id: "EXP-005", destination: "RBI", type: "Data Localization Proof", reference: "DL-Q1-2026", exported: "2026-03-10", status: "pending_review", format: "PDF" },
];

const forensicTimeline = [
  { time: "2026-03-18 14:45:00", actor: "system", action: "REGULATOR_EXPORT", target: "DPB – Breach Notification for INC-101", integrity: "SHA-256: a8f2c91d..." },
  { time: "2026-03-18 14:32:01", actor: "admin@dpdp.gov.in", action: "POLICY_APPLIED", target: "Masking Policy MP-04 → PostgreSQL Prod", integrity: "SHA-256: b3d9e7a2..." },
  { time: "2026-03-18 14:15:44", actor: "system", action: "DSR_CREATED", target: "DSR #442 – Auto-created from portal", integrity: "SHA-256: c7f1b4d8..." },
  { time: "2026-03-18 14:10:22", actor: "scanner-agent-01", action: "SCAN_COMPLETED", target: "Full PII Scan → PostgreSQL Prod (4,521 records)", integrity: "SHA-256: d2a5c8f3..." },
  { time: "2026-03-18 14:05:00", actor: "system", action: "AUTO_CONTAINMENT", target: "DB-04 read access revoked (INC-101)", integrity: "SHA-256: e9b3d6a1..." },
  { time: "2026-03-18 14:02:12", actor: "siem-connector", action: "ALERT_TRIGGERED", target: "Anomalous query pattern on DB-04", integrity: "SHA-256: f4c8a2b5..." },
  { time: "2026-03-18 13:45:00", actor: "user@example.com", action: "CONSENT_REVOKED", target: "Marketing consent via API", integrity: "SHA-256: a1b2c3d4..." },
  { time: "2026-03-18 12:00:00", actor: "scheduler", action: "PURGE_EXECUTED", target: "230 records past retention period", integrity: "SHA-256: e5f6a7b8..." },
];

const reportStatusColors: Record<string, string> = { final: "bg-primary/10 text-primary", draft: "bg-warning/10 text-warning" };
const exportStatusColors: Record<string, string> = { submitted: "bg-warning/10 text-warning", acknowledged: "bg-primary/10 text-primary", pending_review: "bg-muted text-muted-foreground" };

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

export default function AuditPage() {
  const path = useLocation().pathname;
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { fetchAuditLogs().then(setLogs); }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Audit & Reports</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Immutable audit logs and compliance report generation</p>
      </div>
      <SubtabNav />

      {path === "/audit" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Timestamp", "Action", "User", "Module", "Details"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{l.timestamp}</td>
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{l.action}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.user}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.module}</td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-xs truncate">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/audit/reports" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Title", "Type", "Generated", "Pages", "Format", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {complianceReports.map(r => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{r.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.type}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.generated}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{r.pages}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.format}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${reportStatusColors[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/audit/exports" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Destination", "Type", "Reference", "Exported", "Status", "Format"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {regulatorExports.map(e => (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{e.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{e.destination}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{e.type}</td>
                  <td className="px-4 py-2.5 font-mono-data text-primary">{e.reference}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{e.exported}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${exportStatusColors[e.status]}`}>{e.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{e.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/audit/timeline" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">Forensic Timeline — Immutable Log</h2>
            <span className="text-[11px] font-mono-data text-muted-foreground">INTEGRITY: VERIFIED ✓</span>
          </div>
          <div className="p-4 space-y-0">
            {forensicTimeline.map((t, i) => (
              <div key={i} className="flex gap-3 pb-3 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                  {i < forensicTimeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono-data text-[11px] text-muted-foreground">{t.time}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium font-mono-data rounded-sm bg-muted text-muted-foreground">{t.action}</span>
                  </div>
                  <p className="text-[13px] text-foreground mt-0.5">{t.target}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono-data text-muted-foreground">Actor: {t.actor}</span>
                    <span className="text-[10px] font-mono-data text-muted-foreground">| {t.integrity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
