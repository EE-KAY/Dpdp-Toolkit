import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { fetchDataSources } from "@/api/mock";
import type { DataSource } from "@/api/types";

const subtabs = [
  { label: "PII Index", href: "/data-inventory" },
  { label: "Data Sources", href: "/data-inventory/sources" },
  { label: "Scan Jobs", href: "/data-inventory/scans" },
  { label: "Classification Rules", href: "/data-inventory/classification" },
  { label: "Sensitive Data Map", href: "/data-inventory/map" },
];

const riskColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-primary/10 text-primary",
};

const piiRecords = [
  { id: "PII-001", field: "aadhaar_number", table: "users_pii", source: "PostgreSQL Prod", sensitivity: "critical", count: 12400, masked: true },
  { id: "PII-002", field: "pan_number", table: "kyc_docs", source: "PostgreSQL Prod", sensitivity: "critical", count: 8920, masked: true },
  { id: "PII-003", field: "email", table: "customers", source: "MongoDB Analytics", sensitivity: "high", count: 45200, masked: false },
  { id: "PII-004", field: "phone_number", table: "contacts", source: "MySQL CRM", sensitivity: "high", count: 23100, masked: false },
  { id: "PII-005", field: "ip_address", table: "access_logs", source: "AWS S3", sensitivity: "medium", count: 120000, masked: false },
  { id: "PII-006", field: "bank_account", table: "payments", source: "PostgreSQL Prod", sensitivity: "critical", count: 3400, masked: true },
  { id: "PII-007", field: "date_of_birth", table: "profiles", source: "MongoDB Analytics", sensitivity: "medium", count: 15600, masked: false },
  { id: "PII-008", field: "address", table: "shipping", source: "MySQL CRM", sensitivity: "low", count: 34500, masked: false },
];

const scanJobs = [
  { id: "SCAN-042", source: "PostgreSQL Prod", type: "Full PII Scan", status: "completed", started: "2026-03-18 14:10", duration: "4m 22s", findings: 4521 },
  { id: "SCAN-041", source: "AWS S3 Documents", type: "Incremental", status: "completed", started: "2026-03-18 13:45", duration: "12m 08s", findings: 128 },
  { id: "SCAN-040", source: "MongoDB Analytics", type: "Full PII Scan", status: "running", started: "2026-03-18 14:28", duration: "—", findings: 0 },
  { id: "SCAN-039", source: "Azure Blob Backups", type: "Classification", status: "scheduled", started: "2026-03-18 15:00", duration: "—", findings: 0 },
  { id: "SCAN-038", source: "MySQL CRM", type: "Full PII Scan", status: "failed", started: "2026-03-17 22:00", duration: "1m 03s", findings: 0 },
];

const classificationRules = [
  { id: "CR-01", name: "Aadhaar Detection", pattern: "\\d{4}[- ]?\\d{4}[- ]?\\d{4}", type: "Regex", category: "National ID", active: true, matches: 12400 },
  { id: "CR-02", name: "PAN Card Detection", pattern: "[A-Z]{5}\\d{4}[A-Z]", type: "Regex", category: "Tax ID", active: true, matches: 8920 },
  { id: "CR-03", name: "Email Address", pattern: "NER + Regex", type: "ML + Regex", category: "Contact", active: true, matches: 45200 },
  { id: "CR-04", name: "Bank Account IFSC", pattern: "[A-Z]{4}0[A-Z0-9]{6}", type: "Regex", category: "Financial", active: true, matches: 3400 },
  { id: "CR-05", name: "Phone (India)", pattern: "\\+91[\\d]{10}", type: "Regex", category: "Contact", active: false, matches: 23100 },
  { id: "CR-06", name: "Passport Number", pattern: "[A-Z]\\d{7}", type: "Regex", category: "National ID", active: true, matches: 220 },
];

const sensitiveMap = [
  { zone: "PostgreSQL Production", critical: 3, high: 2, medium: 1, low: 0, total_pii: 24720 },
  { zone: "MongoDB Analytics", critical: 1, high: 2, medium: 3, low: 1, total_pii: 16493 },
  { zone: "AWS S3 Documents", critical: 0, high: 1, medium: 2, low: 2, total_pii: 2108 },
  { zone: "Azure Blob Backups", critical: 0, high: 0, medium: 1, low: 3, total_pii: 890 },
  { zone: "MySQL CRM", critical: 0, high: 1, medium: 1, low: 2, total_pii: 560 },
  { zone: "CSV Legacy Exports", critical: 2, high: 1, medium: 0, low: 0, total_pii: 3070 },
];

const scanStatusColors: Record<string, string> = {
  completed: "bg-primary/10 text-primary",
  running: "bg-warning/10 text-warning",
  scheduled: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
};

const sensColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-warning/10 text-warning",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
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

export default function DataInventoryPage() {
  const location = useLocation();
  const path = location.pathname;
  const [sources, setSources] = useState<DataSource[]>([]);
  useEffect(() => { fetchDataSources().then(setSources); }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Data Inventory</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Unified view of all PII across systems</p>
      </div>
      <SubtabNav />

      {/* PII Index */}
      {path === "/data-inventory" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto fade-right-mask">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Field</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Table</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Sensitivity</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Count</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Masked</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {piiRecords.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.id}</td>
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{r.field}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.table}</td>
                  <td className="px-4 py-2.5 text-foreground">{r.source}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${sensColors[r.sensitivity]}`}>{r.sensitivity}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{r.count.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${r.masked ? "bg-primary" : "bg-destructive"}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Sources */}
      {path === "/data-inventory/sources" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto fade-right-mask">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Type</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">PII Count</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Risk</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Last Scan</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{s.type}</td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{s.pii_count.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${riskColors[s.risk]}`}>{s.risk}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{s.last_scan}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${s.status === "active" ? "bg-primary" : "bg-muted-foreground"}`} /><span className="text-muted-foreground capitalize">{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scan Jobs */}
      {path === "/data-inventory/scans" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Job ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Started</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Duration</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Findings</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {scanJobs.map((j) => (
                <tr key={j.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{j.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{j.source}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{j.type}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${scanStatusColors[j.status]}`}>{j.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{j.started}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{j.duration}</td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{j.findings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Classification Rules */}
      {path === "/data-inventory/classification" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Rule Name</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Pattern</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Active</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Matches</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {classificationRules.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-[12px] text-muted-foreground">{c.pattern}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.category}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${c.active ? "bg-primary" : "bg-muted-foreground"}`} /></td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{c.matches.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sensitive Data Map */}
      {path === "/data-inventory/map" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Data Zone</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Critical</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">High</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Medium</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Low</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Total PII</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {sensitiveMap.map((s) => (
                <tr key={s.zone} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.zone}</td>
                  <td className="px-4 py-2.5 text-right font-mono-data"><span className={s.critical > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>{s.critical}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono-data"><span className={s.high > 0 ? "text-warning font-medium" : "text-muted-foreground"}>{s.high}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{s.medium}</td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-muted-foreground">{s.low}</td>
                  <td className="px-4 py-2.5 text-right font-mono-data font-medium text-foreground">{s.total_pii.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
