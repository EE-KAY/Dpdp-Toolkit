import { useLocation, Link } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants";

interface ModulePageProps {
  title: string;
  description: string;
  navKey: string;
  children?: React.ReactNode;
}

export default function ModulePage({ title, description, navKey, children }: ModulePageProps) {
  const location = useLocation();
  const navItem = NAV_ITEMS.find((n) => n.href === `/${navKey}` || n.label.toLowerCase().replace(/[^a-z]/g, "-").includes(navKey));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
      </div>

      {/* Subtab bar */}
      {navItem && (
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {navItem.subtabs.map((sub) => (
            <Link
              key={sub.href}
              to={sub.href}
              className={`px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                location.pathname === sub.href
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}

      {children || (
        <div className="bg-card border border-border rounded-sm p-8 text-center sovereign-shadow">
          <p className="text-muted-foreground text-[13px]">Module content will be rendered here.</p>
          <p className="text-muted-foreground text-[11px] mt-1 font-mono-data">Connect to backend API to populate data.</p>
        </div>
      )}
    </div>
  );
}
