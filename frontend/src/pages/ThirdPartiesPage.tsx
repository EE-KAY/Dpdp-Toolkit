import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { fetchVendors } from "@/api/mock";
import type { Vendor } from "@/api/types";

const subtabs = [
  { label: "Vendor Registry", href: "/third-parties" },
  { label: "Data Sharing Logs", href: "/third-parties/sharing" },
  { label: "Risk Scores", href: "/third-parties/risk" },
  { label: "Revocation Requests", href: "/third-parties/revocation" },
];

const sharingLogs = [
  { id: "DSL-301", vendor: "CloudSync Analytics", data_type: "Aadhaar (Hashed)", records: 4200, purpose: "Analytics", shared: "2026-03-18 10:00", consent: true },
  { id: "DSL-300", vendor: "PayGate India", data_type: "PAN, Bank Details", records: 1200, purpose: "Payment Processing", shared: "2026-03-17 14:30", consent: true },
  { id: "DSL-299", vendor: "MailJet Comms", data_type: "Email, Phone", records: 8400, purpose: "Marketing", shared: "2026-03-16 09:00", consent: true },
  { id: "DSL-298", vendor: "DataVault Corp", data_type: "Aadhaar, Address", records: 560, purpose: "KYC Verification", shared: "2026-03-15 11:00", consent: false },
  { id: "DSL-297", vendor: "CloudSync Analytics", data_type: "Email", records: 14200, purpose: "Service Delivery", shared: "2026-03-14 08:00", consent: true },
];

const riskScores = [
  { vendor: "CloudSync Analytics", overall: 82, data_handling: 85, security: 78, compliance: 84, last_assessment: "2d ago", trend: "stable" },
  { vendor: "PayGate India", overall: 45, data_handling: 40, security: 52, compliance: 42, last_assessment: "15d ago", trend: "declining" },
  { vendor: "MailJet Comms", overall: 91, data_handling: 93, security: 88, compliance: 92, last_assessment: "5d ago", trend: "improving" },
  { vendor: "DataVault Corp", overall: 28, data_handling: 22, security: 30, compliance: 32, last_assessment: "30d ago", trend: "critical" },
];

const revocations = [
  { id: "REV-012", vendor: "DataVault Corp", reason: "Non-compliance: Aadhaar data retained past consent period", status: "pending", requested: "2026-03-17", data_affected: "560 records" },
  { id: "REV-011", vendor: "PayGate India", reason: "Risk score below threshold (45 < 50)", status: "in_review", requested: "2026-03-15", data_affected: "1,200 records" },
  { id: "REV-010", vendor: "CloudSync Analytics", reason: "User-initiated bulk revocation (Marketing purpose)", status: "completed", requested: "2026-03-10", data_affected: "890 records" },
  { id: "REV-009", vendor: "MailJet Comms", reason: "Contract renewal pending — precautionary hold", status: "cancelled", requested: "2026-03-05", data_affected: "0 records" },
];

const vendorStatusColors: Record<string, string> = { compliant: "bg-primary/10 text-primary", non_compliant: "bg-destructive/10 text-destructive", under_review: "bg-warning/10 text-warning" };
const revStatusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", in_review: "bg-primary/10 text-primary", completed: "bg-primary/10 text-primary", cancelled: "bg-muted text-muted-foreground" };
const trendColors: Record<string, string> = { improving: "text-primary", stable: "text-muted-foreground", declining: "text-warning", critical: "text-destructive" };

function RiskBar({ value }: { value: number }) {
  const color = value >= 70 ? "bg-primary" : value >= 40 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-muted rounded-sm overflow-hidden"><div className={`h-full ${color} rounded-sm`} style={{ width: `${value}%` }} /></div>
      <span className="font-mono-data text-[11px]">{value}</span>
    </div>
  );
}

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

export default function ThirdPartiesPage() {
  const path = useLocation().pathname;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  useEffect(() => { fetchVendors().then(setVendors); }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Third Parties</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Vendor registry, data sharing, and risk assessment</p>
      </div>
      <SubtabNav />

      {path === "/third-parties" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Vendor", "Risk Score", "Data Shared", "Status", "Last Audit"].map(h => (
                <th key={h} className={`${h === "Risk Score" ? "text-right" : "text-left"} px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider`}>{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {vendors.map(v => (
                <tr key={v.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{v.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono-data text-foreground">{v.risk_score}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{v.data_shared.join(", ")}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${vendorStatusColors[v.status]}`}>{v.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{v.last_audit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/third-parties/sharing" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Log ID", "Vendor", "Data Type", "Records", "Purpose", "Shared", "Consent"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {sharingLogs.map(l => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{l.vendor}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{l.data_type}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{l.records.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.purpose}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{l.shared}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block ${l.consent ? "bg-primary" : "bg-destructive"}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/third-parties/risk" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Vendor", "Overall", "Data Handling", "Security", "Compliance", "Last Assessment", "Trend"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {riskScores.map(r => (
                <tr key={r.vendor} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.vendor}</td>
                  <td className="px-4 py-2.5"><RiskBar value={r.overall} /></td>
                  <td className="px-4 py-2.5"><RiskBar value={r.data_handling} /></td>
                  <td className="px-4 py-2.5"><RiskBar value={r.security} /></td>
                  <td className="px-4 py-2.5"><RiskBar value={r.compliance} /></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.last_assessment}</td>
                  <td className="px-4 py-2.5"><span className={`text-[11px] font-medium uppercase ${trendColors[r.trend]}`}>{r.trend}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/third-parties/revocation" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Vendor", "Reason", "Status", "Requested", "Data Affected"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {revocations.map(r => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{r.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{r.vendor}</td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-xs">{r.reason}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm ${revStatusColors[r.status]}`}>{r.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{r.requested}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{r.data_affected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
