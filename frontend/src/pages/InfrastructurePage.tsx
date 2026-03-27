import { useLocation, Link } from "react-router-dom";

const subtabs = [
  { label: "Agents (Endpoints)", href: "/infrastructure" },
  { label: "Cloud Connectors", href: "/infrastructure/cloud" },
  { label: "Database Connectors", href: "/infrastructure/database" },
  { label: "Scan Status", href: "/infrastructure/scan-status" },
  { label: "Policy Deployment", href: "/infrastructure/deployment" },
];

const agents = [
  { id: "AGT-001", name: "KA-SOUTH-01", location: "Bangalore DC-1", status: "online", version: "v2.4.1", last_heartbeat: "30s ago", cpu: 12, memory: 34 },
  { id: "AGT-002", name: "KA-SOUTH-02", location: "Bangalore DC-2", status: "online", version: "v2.4.1", last_heartbeat: "30s ago", cpu: 8, memory: 28 },
  { id: "AGT-003", name: "KA-SOUTH-03", location: "Bangalore DC-1", status: "offline", version: "v2.4.0", last_heartbeat: "4h ago", cpu: 0, memory: 0 },
  { id: "AGT-004", name: "MH-WEST-01", location: "Mumbai DC-1", status: "online", version: "v2.4.1", last_heartbeat: "28s ago", cpu: 22, memory: 45 },
  { id: "AGT-005", name: "DL-NORTH-01", location: "Delhi DC-1", status: "degraded", version: "v2.3.9", last_heartbeat: "2m ago", cpu: 89, memory: 78 },
];

const cloudConnectors = [
  { id: "CC-01", provider: "AWS", service: "S3", region: "ap-south-1", status: "connected", buckets: 12, last_sync: "2m ago" },
  { id: "CC-02", provider: "AWS", service: "RDS", region: "ap-south-1", status: "connected", buckets: 3, last_sync: "5m ago" },
  { id: "CC-03", provider: "Azure", service: "Blob Storage", region: "centralindia", status: "connected", buckets: 5, last_sync: "8m ago" },
  { id: "CC-04", provider: "GCP", service: "Cloud SQL", region: "asia-south1", status: "disconnected", buckets: 0, last_sync: "—" },
];

const dbConnectors = [
  { id: "DBC-01", name: "PostgreSQL Production", host: "db-prod.internal:5432", type: "PostgreSQL 15", status: "connected", tables: 42, last_query: "1m ago" },
  { id: "DBC-02", name: "MongoDB Analytics", host: "mongo-analytics.internal:27017", type: "MongoDB 7.0", status: "connected", tables: 18, last_query: "3m ago" },
  { id: "DBC-03", name: "MySQL CRM", host: "crm-db.internal:3306", type: "MySQL 8.0", status: "connected", tables: 28, last_query: "12m ago" },
  { id: "DBC-04", name: "Redis Cache", host: "cache.internal:6379", type: "Redis 7.2", status: "connected", tables: 0, last_query: "30s ago" },
  { id: "DBC-05", name: "Legacy Oracle", host: "oracle.corp.in:1521", type: "Oracle 19c", status: "error", tables: 0, last_query: "—" },
];

const scanStatus = [
  { agent: "KA-SOUTH-01", active_scans: 2, queued: 5, completed_today: 14, failed_today: 0, throughput: "1,240 rec/s" },
  { agent: "KA-SOUTH-02", active_scans: 1, queued: 3, completed_today: 11, failed_today: 0, throughput: "980 rec/s" },
  { agent: "MH-WEST-01", active_scans: 3, queued: 8, completed_today: 22, failed_today: 1, throughput: "1,560 rec/s" },
  { agent: "DL-NORTH-01", active_scans: 0, queued: 12, completed_today: 3, failed_today: 4, throughput: "210 rec/s" },
];

const deployments = [
  { id: "DEP-042", policy: "MP-04 – Aadhaar Full Mask", targets: "All Agents", status: "deployed", deployed_at: "2026-03-18 14:35", success_rate: "3/4 agents" },
  { id: "DEP-041", policy: "RP-04 – Session Purge", targets: "KA-SOUTH-*", status: "deployed", deployed_at: "2026-03-18 12:00", success_rate: "2/2 agents" },
  { id: "DEP-040", policy: "CR-06 – Passport Detection", targets: "All Agents", status: "pending", deployed_at: "—", success_rate: "—" },
  { id: "DEP-039", policy: "CP-02 – Marketing Opt-In", targets: "MH-WEST-01", status: "failed", deployed_at: "2026-03-17 09:00", success_rate: "0/1 agents" },
];

const agentStatusColors: Record<string, string> = { online: "bg-primary", offline: "bg-destructive", degraded: "bg-warning" };
const connStatusColors: Record<string, string> = { connected: "bg-primary", disconnected: "bg-destructive", error: "bg-destructive" };
const depStatusColors: Record<string, string> = { deployed: "bg-primary/10 text-primary", pending: "bg-warning/10 text-warning", failed: "bg-destructive/10 text-destructive" };

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

export default function InfrastructurePage() {
  const path = useLocation().pathname;
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Infrastructure</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Agent monitoring, connectors, and policy deployment</p>
      </div>
      <SubtabNav />

      {path === "/infrastructure" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Agent Name", "Location", "Status", "Version", "Heartbeat", "CPU %", "MEM %"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {agents.map(a => (
                <tr key={a.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{a.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{a.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{a.location}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${agentStatusColors[a.status]}`} /><span className="text-muted-foreground capitalize">{a.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{a.version}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{a.last_heartbeat}</td>
                  <td className="px-4 py-2.5 font-mono-data"><span className={a.cpu > 80 ? "text-destructive font-medium" : "text-foreground"}>{a.cpu}</span></td>
                  <td className="px-4 py-2.5 font-mono-data"><span className={a.memory > 70 ? "text-warning font-medium" : "text-foreground"}>{a.memory}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/infrastructure/cloud" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Provider", "Service", "Region", "Status", "Resources", "Last Sync"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {cloudConnectors.map(c => (
                <tr key={c.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.provider}</td>
                  <td className="px-4 py-2.5 text-foreground">{c.service}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{c.region}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${connStatusColors[c.status]}`} /><span className="text-muted-foreground capitalize">{c.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{c.buckets}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{c.last_sync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/infrastructure/database" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Name", "Host", "Type", "Status", "Tables", "Last Query"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {dbConnectors.map(d => (
                <tr key={d.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{d.id}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground text-[12px]">{d.host}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.type}</td>
                  <td className="px-4 py-2.5"><span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${connStatusColors[d.status]}`} /><span className="text-muted-foreground capitalize">{d.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{d.tables}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{d.last_query}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/infrastructure/scan-status" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Agent", "Active Scans", "Queued", "Completed Today", "Failed Today", "Throughput"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {scanStatus.map(s => (
                <tr key={s.agent} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.agent}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{s.active_scans}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{s.queued}</td>
                  <td className="px-4 py-2.5 font-mono-data text-primary">{s.completed_today}</td>
                  <td className="px-4 py-2.5 font-mono-data"><span className={s.failed_today > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>{s.failed_today}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{s.throughput}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {path === "/infrastructure/deployment" && (
        <div className="bg-card border border-border rounded-sm sovereign-shadow overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border bg-muted/30">
              {["ID", "Policy", "Targets", "Status", "Deployed At", "Success Rate"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {deployments.map(d => (
                <tr key={d.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono-data font-medium text-foreground">{d.id}</td>
                  <td className="px-4 py-2.5 text-foreground">{d.policy}</td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground">{d.targets}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-[11px] font-medium rounded-sm uppercase ${depStatusColors[d.status]}`}>{d.status}</span></td>
                  <td className="px-4 py-2.5 font-mono-data text-muted-foreground whitespace-nowrap">{d.deployed_at}</td>
                  <td className="px-4 py-2.5 font-mono-data text-foreground">{d.success_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
