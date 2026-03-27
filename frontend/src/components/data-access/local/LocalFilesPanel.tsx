import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  HardDrive,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Loader2,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  FileCode,
  FileArchive,
  Film,
  Music,
  Eye,
} from "lucide-react";

interface FileEntry {
  name: string;
  kind: "file" | "directory";
  path: string;
  size?: number;
  lastModified?: number;
  extension?: string;
  handle?: FileSystemFileHandle;
}

interface DirNode {
  name: string;
  path: string;
  selected: boolean;
  expanded: boolean;
  children: DirNode[];
  loading: boolean;
  handle?: FileSystemDirectoryHandle;
}

interface FileStats {
  total: number;
  byType: Record<
    string,
    { count: number; size: number; icon: React.ReactNode }
  >;
  totalSize: number;
}

interface DirProgress {
  name: string;
  processed: number;
  total: number;
  status: "pending" | "scanning" | "done";
}

const FILE_CATEGORIES: Record<
  string,
  { label: string; extensions: string[]; icon: React.ReactNode }
> = {
  pdf: {
    label: "PDFs",
    extensions: [".pdf"],
    icon: <FileText className="w-4 h-4" />,
  },
  csv: {
    label: "CSVs / Spreadsheets",
    extensions: [".csv", ".xlsx", ".xls", ".tsv", ".ods"],
    icon: <FileSpreadsheet className="w-4 h-4" />,
  },
  images: {
    label: "Images",
    extensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
      ".webp",
      ".bmp",
      ".ico",
      ".tiff",
    ],
    icon: <Image className="w-4 h-4" />,
  },
  documents: {
    label: "Documents",
    extensions: [".doc", ".docx", ".odt", ".rtf", ".txt", ".md"],
    icon: <FileText className="w-4 h-4" />,
  },
  code: {
    label: "Code Files",
    extensions: [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".go",
      ".rs",
      ".html",
      ".css",
      ".scss",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".toml",
      ".sql",
      ".sh",
      ".bat",
      ".php",
      ".rb",
    ],
    icon: <FileCode className="w-4 h-4" />,
  },
  archives: {
    label: "Archives",
    extensions: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    icon: <FileArchive className="w-4 h-4" />,
  },
  video: {
    label: "Videos",
    extensions: [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"],
    icon: <Film className="w-4 h-4" />,
  },
  audio: {
    label: "Audio",
    extensions: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a"],
    icon: <Music className="w-4 h-4" />,
  },
};

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  "coverage",
]);

const RELEVANT_EXT = new Set([
  "txt",
  "csv",
  "json",
  "md",
  "log",
  "pdf",
  "docx",
  "xlsx",
]);

function categorizeFile(name: string): string {
  const ext = "." + name.split(".").pop()?.toLowerCase();
  for (const [cat, { extensions }] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) return cat;
  }
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function LocalFilesPanel() {
  const [rootDirs, setRootDirs] = useState<DirNode[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<FileEntry[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [scanProgress, setScanProgress] = useState("");
  const [treeFiles, setTreeFiles] = useState<Record<string, FileEntry[]>>({});
  const [dirProgress, setDirProgress] = useState<Record<string, DirProgress>>(
    {},
  );
  const [fileListLimit, setFileListLimit] = useState(100);
  const [preview, setPreview] = useState<{
    name: string;
    path: string;
    content?: string;
    url?: string;
    mime?: string;
    kind: "text" | "image" | "pdf" | "unsupported";
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const rootDirsRef = useRef<DirNode[]>([]);
  const dirProgressRef = useRef<Record<string, DirProgress>>({});
  const lastProgressUpdateRef = useRef(0);
  const bufferedCountRef = useRef(0);

  const filesByType = useMemo(() => {
    const map: Record<string, FileEntry[]> = {};
    for (const f of scannedFiles) {
      const cat = categorizeFile(f.name);
      if (!map[cat]) map[cat] = [];
      if (map[cat].length < 10) map[cat].push(f);
    }
    return map;
  }, [scannedFiles]);

  useEffect(() => {
    rootDirsRef.current = rootDirs;
  }, [rootDirs]);

  useEffect(() => {
    dirProgressRef.current = dirProgress;
  }, [dirProgress]);

  const supportsAPI =
    typeof window !== "undefined" && "showDirectoryPicker" in window;

  const loadChildren = useCallback(
    async (handle: FileSystemDirectoryHandle, parentPath: string) => {
      const dirs: DirNode[] = [];
      const files: FileEntry[] = [];
      try {
        for await (const entry of (handle as any).values()) {
          if (entry.kind === "directory") {
            if (SKIP_DIRS.has(entry.name)) continue;
            dirs.push({
              name: entry.name,
              path: parentPath + "/" + entry.name,
              selected: true,
              expanded: false,
              children: [],
              loading: false,
              handle: entry,
            });
          } else {
            const ext = entry.name.includes(".")
              ? entry.name.split(".").pop()?.toLowerCase()
              : undefined;
            const size = 0; // lazily fetched only when previewing
            files.push({
              name: entry.name,
              kind: "file",
              path: parentPath + "/" + entry.name,
              size,
              extension: ext,
              handle: entry,
            });
          }
        }
      } catch {}
      dirs.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
      return { dirs, files };
    },
    [],
  );

  const addDirectory = useCallback(async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: "read",
      });
      const parentPath = "/" + dirHandle.name;
      const exists = rootDirsRef.current.some((d) => d.path === parentPath);
      if (exists) return;

      const { dirs, files } = await loadChildren(dirHandle, parentPath);

      const newDir: DirNode = {
        name: dirHandle.name,
        path: parentPath,
        selected: true,
        expanded: true,
        children: dirs,
        loading: false,
        handle: dirHandle,
      };

      setRootDirs((prev) => [...prev, newDir]);
      setTreeFiles((prev) => ({ ...prev, [parentPath]: files }));
    } catch {}
  }, [loadChildren]);

  const toggleExpand = useCallback(
    async (path: string) => {
      const inferProgressChildren = (parentPath: string): DirNode[] => {
        const inferred: Record<string, DirNode> = {};
        const progress = dirProgressRef.current;
        const prefix = parentPath.endsWith("/") ? parentPath : parentPath + "/";

        for (const key of Object.keys(progress)) {
          if (!key.startsWith(prefix)) continue;
          const remainder = key.slice(prefix.length);
          if (!remainder || remainder.includes("/")) continue;
          const name = remainder;
          if (inferred[key]) continue;
          inferred[key] = {
            name,
            path: key,
            selected: true,
            expanded: false,
            children: [],
            loading: false,
          };
        }

        return Object.values(inferred).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      };

      const mergeChildren = (existing: DirNode[], inferred: DirNode[]) => {
        const byPath = new Map<string, DirNode>();
        for (const c of existing) byPath.set(c.path, c);
        for (const c of inferred)
          if (!byPath.has(c.path)) byPath.set(c.path, c);
        return Array.from(byPath.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      };

      const findNode = (nodes: DirNode[]): DirNode | null => {
        for (const n of nodes) {
          if (n.path === path) return n;
          const found = findNode(n.children);
          if (found) return found;
        }
        return null;
      };

      const target = findNode(rootDirsRef.current);
      if (!target) return;
      const newExpanded = !target.expanded;
      const needsLoad =
        newExpanded && target.children.length === 0 && !!target.handle;
      const inferredChildren = newExpanded ? inferProgressChildren(path) : [];

      const toggleExpanded = (nodes: DirNode[]): DirNode[] =>
        nodes.map((n) => {
          if (n.path === path)
            return {
              ...n,
              expanded: newExpanded,
              loading: needsLoad,
              children: mergeChildren(n.children, inferredChildren),
            };
          return { ...n, children: toggleExpanded(n.children) };
        });

      setRootDirs((prev) => toggleExpanded(prev));

      if (needsLoad && target.handle) {
        const { dirs, files } = await loadChildren(target.handle, target.path);
        setTreeFiles((prev) => ({ ...prev, [target.path]: files }));

        const attachChildren = (nodes: DirNode[]): DirNode[] =>
          nodes.map((n) => {
            if (n.path === path)
              return {
                ...n,
                children: mergeChildren(dirs, inferProgressChildren(path)),
                loading: false,
                expanded: newExpanded,
              };
            return { ...n, children: attachChildren(n.children) };
          });

        setRootDirs((prev) => attachChildren(prev));
      }
    },
    [loadChildren],
  );

  const toggleSelect = useCallback((path: string) => {
    setRootDirs((prev) => {
      const update = (nodes: DirNode[]): DirNode[] =>
        nodes.map((n) => {
          if (n.path === path) {
            const newSelected = !n.selected;
            const selectAll = (node: DirNode): DirNode => ({
              ...node,
              selected: newSelected,
              children: node.children.map(selectAll),
            });
            return selectAll(n);
          }
          return { ...n, children: update(n.children) };
        });
      return update(prev);
    });
  }, []);

  const removeDir = useCallback((path: string) => {
    setRootDirs((prev) => prev.filter((d) => d.path !== path));
    setTreeFiles((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(path)) delete next[key];
      }
      return next;
    });
  }, []);

  const scanFiles = useCallback(async () => {
    setScanning(true);
    setScannedFiles([]);
    setStats(null);
    setDirProgress({});
    setFileListLimit(100);
    lastProgressUpdateRef.current = 0;
    bufferedCountRef.current = 0;
    const allFiles: FileEntry[] = [];
    try {
      const bumpProgress = (
        key: string,
        name: string,
        deltaProcessed = 0,
        deltaTotal = 0,
        forceStatus?: DirProgress["status"],
      ) => {
        setDirProgress((prev) => {
          const current = prev[key] || {
            name,
            processed: 0,
            total: 1,
            status: "pending" as const,
          };
          const nextTotal = Math.max(1, current.total + deltaTotal);
          const nextProcessed = Math.max(0, current.processed + deltaProcessed);
          const status =
            forceStatus || (nextProcessed >= nextTotal ? "done" : "scanning");
          return {
            ...prev,
            [key]: {
              ...current,
              processed: nextProcessed,
              total: nextTotal,
              status,
            },
          };
        });
      };

      const queue: Array<() => Promise<void>> = [];
      const CONCURRENCY = 30;

      const runQueue = async () => {
        const workers = Array.from({ length: CONCURRENCY }, async () => {
          while (queue.length > 0) {
            const job = queue.shift();
            if (!job) break;
            await job();
          }
        });
        await Promise.all(workers);
      };

      const scanDir = async (
        handle: FileSystemDirectoryHandle,
        basePath: string,
        progressKey: string,
        label: string,
        depth: number,
      ) => {
        if (depth > 8) return;
        bumpProgress(progressKey, label, 0, 0, "scanning");

        try {
          const entries: any[] = [];
          for await (const entry of (handle as any).values())
            entries.push(entry);
          bumpProgress(progressKey, label, 0, entries.length);

          const processEntries = entries.map(async (entry) => {
            if (entry.kind === "file") {
              const ext = entry.name.includes(".")
                ? entry.name.split(".").pop()?.toLowerCase()
                : undefined;
              if (!ext || !RELEVANT_EXT.has(ext)) {
                bumpProgress(progressKey, label, 1, 0);
                return;
              }

              try {
                allFiles.push({
                  name: entry.name,
                  kind: "file",
                  path: basePath + "/" + entry.name,
                  size: 0,
                  lastModified: undefined,
                  extension: ext,
                  handle: entry,
                });
                bufferedCountRef.current += 1;
                const now = Date.now();
                if (
                  bufferedCountRef.current >= 500 ||
                  now - lastProgressUpdateRef.current > 200
                ) {
                  setScanProgress(
                    `Scanning... ${allFiles.length.toLocaleString()} files found`,
                  );
                  bufferedCountRef.current = 0;
                  lastProgressUpdateRef.current = now;
                }
                bumpProgress(progressKey, label, 1, 0);
              } catch {}
            } else if (entry.kind === "directory") {
              if (SKIP_DIRS.has(entry.name)) {
                bumpProgress(progressKey, label, 1, 0);
                return;
              }

              const childPath = basePath + "/" + entry.name;
              bumpProgress(progressKey, label, 0, 1);
              bumpProgress(childPath, entry.name, 0, 1, "pending");
              queue.push(async () => {
                await scanDir(
                  entry,
                  childPath,
                  childPath,
                  entry.name,
                  depth + 1,
                );
                bumpProgress(progressKey, label, 1, 0);
                bumpProgress(childPath, entry.name, 1, 0, "done");
              });
            }
          });

          await Promise.all(processEntries);
        } catch {}
      };

      for (const dir of rootDirs) {
        if (dir.selected && dir.handle) {
          setScanProgress(`Scanning ${dir.name}...`);
          bumpProgress(dir.path, dir.name, 0, 0, "scanning");

          const entries: any[] = [];
          try {
            for await (const entry of (dir.handle as any).values())
              entries.push(entry);
          } catch {}

          await Promise.all(
            entries.map(async (entry) => {
              if (entry.kind === "file") {
                const ext = entry.name.includes(".")
                  ? entry.name.split(".").pop()?.toLowerCase()
                  : undefined;
                if (!ext || !RELEVANT_EXT.has(ext)) {
                  bumpProgress(dir.path, dir.name, 1, 0);
                  return;
                }

                try {
                  allFiles.push({
                    name: entry.name,
                    kind: "file",
                    path: dir.path + "/" + entry.name,
                    size: 0,
                    lastModified: undefined,
                    extension: ext,
                    handle: entry,
                  });
                  bufferedCountRef.current += 1;
                  const now = Date.now();
                  if (
                    bufferedCountRef.current >= 500 ||
                    now - lastProgressUpdateRef.current > 200
                  ) {
                    setScanProgress(
                      `Scanning... ${allFiles.length.toLocaleString()} files found`,
                    );
                    bufferedCountRef.current = 0;
                    lastProgressUpdateRef.current = now;
                  }
                  bumpProgress(dir.path, dir.name, 1, 0);
                } catch {}
              } else if (entry.kind === "directory") {
                if (SKIP_DIRS.has(entry.name)) {
                  bumpProgress(dir.path, dir.name, 1, 0);
                  return;
                }

                const childPath = dir.path + "/" + entry.name;
                bumpProgress(dir.path, dir.name, 0, 1);
                bumpProgress(childPath, entry.name, 0, 1, "pending");
                queue.push(async () => {
                  await scanDir(entry, childPath, childPath, entry.name, 0);
                  bumpProgress(dir.path, dir.name, 1, 0);
                  bumpProgress(childPath, entry.name, 1, 0, "done");
                });
              }
            }),
          );

          if (entries.length > 0)
            bumpProgress(dir.path, dir.name, 0, entries.length);
        }
      }

      await runQueue();

      const byType: Record<
        string,
        { count: number; size: number; icon: React.ReactNode }
      > = {};
      let totalSize = 0;
      for (const f of allFiles) {
        const cat = categorizeFile(f.name);
        if (!byType[cat]) {
          const catInfo = FILE_CATEGORIES[cat];
          byType[cat] = {
            count: 0,
            size: 0,
            icon: catInfo?.icon || <File className="w-4 h-4" />,
          };
        }
        byType[cat].count++;
        byType[cat].size += f.size || 0;
        totalSize += f.size || 0;
      }

      setScannedFiles(allFiles);
      setStats({ total: allFiles.length, byType, totalSize });
      setFileListLimit(Math.min(100, allFiles.length));
    } catch {
    } finally {
      setScanning(false);
      setScanProgress("");
    }
  }, [rootDirs]);

  const getFileIcon = (name: string) => {
    const cat = categorizeFile(name);
    const catInfo = FILE_CATEGORIES[cat];
    if (catInfo) return <span className="text-primary/60">{catInfo.icon}</span>;
    return <File className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const closePreview = useCallback(() => {
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setPreviewError("");
    setPreviewLoading(false);
  }, []);

  const openFile = useCallback(
    async (file: FileEntry) => {
      closePreview();
      setPreviewLoading(true);
      try {
        if (!file.handle)
          throw new Error("File handle not available for preview");

        const blob = await file.handle.getFile();
        const mime = blob.type;
        const isImage = mime.startsWith("image/");
        const isPdf =
          mime === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");

        if (isImage) {
          const url = URL.createObjectURL(blob);
          setPreview({
            name: file.name,
            path: file.path,
            url,
            mime,
            kind: "image",
          });
        } else if (isPdf) {
          const url = URL.createObjectURL(blob);
          setPreview({
            name: file.name,
            path: file.path,
            url,
            mime,
            kind: "pdf",
          });
        } else {
          const LIMIT = 300000; // ~300 KB for quick text previews
          const truncated = blob.size > LIMIT;
          const content = await blob.slice(0, LIMIT).text();
          const suffix = truncated ? "\n\n...[truncated preview]" : "";
          setPreview({
            name: file.name,
            path: file.path,
            content: content + suffix,
            mime,
            kind: "text",
          });
        }
        setPreviewError("");
      } catch (err: any) {
        setPreviewError(err?.message || "Unable to open file");
        setPreview({ name: file.name, path: file.path, kind: "unsupported" });
      } finally {
        setPreviewLoading(false);
      }
    },
    [closePreview],
  );

  const DirTree = ({
    nodes,
    depth = 0,
  }: {
    nodes: DirNode[];
    depth?: number;
  }) => (
    <div className={depth > 0 ? "ml-4 border-l border-border/50 pl-1" : ""}>
      {nodes.map((n) => (
        <div key={n.path}>
          <div className="flex items-center gap-1.5 py-1 px-1 hover:bg-muted/20 rounded-sm group">
            <button
              onClick={() => toggleExpand(n.path)}
              className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
            >
              {n.loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : n.expanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => toggleSelect(n.path)}
              className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                n.selected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/50"
              }`}
            >
              {n.selected && <Check className="w-2.5 h-2.5" />}
            </button>
            <FolderOpen
              className={`w-4 h-4 shrink-0 ${n.selected ? "text-primary" : "text-muted-foreground"}`}
            />
            <span className="text-[12px] text-foreground truncate font-medium">
              {n.name}
            </span>
            {n.children.length > 0 && (
              <span className="text-[10px] text-muted-foreground ml-1 shrink-0">
                ({n.children.length} folder{n.children.length !== 1 ? "s" : ""}
                {treeFiles[n.path]
                  ? `, ${treeFiles[n.path].length} file${treeFiles[n.path].length !== 1 ? "s" : ""}`
                  : ""}
                )
              </span>
            )}
            {!n.children.length && treeFiles[n.path] && (
              <span className="text-[10px] text-muted-foreground ml-1 shrink-0">
                ({treeFiles[n.path].length} file
                {treeFiles[n.path].length !== 1 ? "s" : ""})
              </span>
            )}
            {scanning &&
              dirProgress[n.path] &&
              (() => {
                const prog = dirProgress[n.path];
                const pct = Math.min(
                  100,
                  Math.round((prog.processed / Math.max(prog.total, 1)) * 100),
                );
                return (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${prog.status === "done" ? "bg-primary" : "bg-primary/70"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })()}
          </div>
          {n.expanded && (
            <div className="ml-4 border-l border-border/30 pl-1">
              {n.children.length > 0 && (
                <DirTree nodes={n.children} depth={depth + 1} />
              )}
              {treeFiles[n.path] && treeFiles[n.path].length > 0 && (
                <div className="mt-1">
                  {treeFiles[n.path].slice(0, 50).map((f) => (
                    <div
                      key={f.path}
                      className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-muted/10 rounded-sm"
                    >
                      <span className="w-3.5 h-3.5 shrink-0" />
                      {getFileIcon(f.name)}
                      <button
                        onClick={() => openFile(f)}
                        className="text-[11px] text-foreground/80 truncate text-left flex-1 hover:text-primary"
                        title="Open preview"
                      >
                        {f.name}
                      </button>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                        {f.size ? formatBytes(f.size) : ""}
                      </span>
                      {f.extension && (
                        <span className="text-[9px] px-1 py-0.5 bg-muted/50 rounded text-muted-foreground uppercase shrink-0">
                          {f.extension}
                        </span>
                      )}
                      <button
                        onClick={() => openFile(f)}
                        className="text-primary hover:text-primary/80"
                        title="Open preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {treeFiles[n.path].length > 50 && (
                    <div className="text-[10px] text-muted-foreground px-6 py-1">
                      ... and {treeFiles[n.path].length - 50} more files
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (!supportsAPI) {
    return (
      <div className="bg-card border border-border rounded-sm p-6 text-center space-y-2">
        <p className="text-[13px] text-destructive font-medium">
          File System Access API not supported
        </p>
        <p className="text-[12px] text-muted-foreground">
          Please use Chrome, Edge, or Opera to access local file scanning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Select Directories
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Click folders to expand and explore. Toggle checkboxes to
              select/deselect.
            </p>
          </div>
          <button
            onClick={addDirectory}
            className="px-3 py-1.5 text-[12px] font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
          >
            + Add Directory
          </button>
        </div>

        {rootDirs.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-8 text-center">
            <HardDrive className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-[12px] text-muted-foreground">
              No directories added yet.
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Click "Add Directory" to pick a drive or folder to explore.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rootDirs.map((dir) => (
              <div
                key={dir.path}
                className="border border-border rounded-sm p-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" />
                    <span className="text-[13px] font-semibold text-foreground">
                      {dir.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {dir.children.length} subfolder
                      {dir.children.length !== 1 ? "s" : ""}
                      {treeFiles[dir.path]
                        ? `, ${treeFiles[dir.path].length} files`
                        : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => removeDir(dir.path)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {dir.children.length > 0 && (
                    <DirTree nodes={dir.children} depth={1} />
                  )}
                  {treeFiles[dir.path] && treeFiles[dir.path].length > 0 && (
                    <div className="ml-4 border-l border-border/30 pl-1">
                      {treeFiles[dir.path].slice(0, 50).map((f) => (
                        <div
                          key={f.path}
                          className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-muted/10 rounded-sm"
                        >
                          <span className="w-3.5 h-3.5 shrink-0" />
                          {getFileIcon(f.name)}
                          <button
                            onClick={() => openFile(f)}
                            className="text-[11px] text-foreground/80 truncate text-left flex-1 hover:text-primary"
                            title="Open preview"
                          >
                            {f.name}
                          </button>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {f.size ? formatBytes(f.size) : ""}
                          </span>
                          {f.extension && (
                            <span className="text-[9px] px-1 py-0.5 bg-muted/50 rounded text-muted-foreground uppercase shrink-0">
                              {f.extension}
                            </span>
                          )}
                          <button
                            onClick={() => openFile(f)}
                            className="text-primary hover:text-primary/80"
                            title="Open preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {treeFiles[dir.path].length > 50 && (
                        <div className="text-[10px] text-muted-foreground px-6 py-1">
                          ... and {treeFiles[dir.path].length - 50} more files
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rootDirs.length > 0 && (!stats || scanning) && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={scanFiles}
              disabled={scanning}
              className="px-4 py-2 text-[12px] font-semibold bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {scanning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {scanning ? "Scanning..." : "Deep Scan Selected Directories"}
            </button>
            {scanProgress && (
              <span className="text-[11px] text-muted-foreground animate-pulse">
                {scanProgress}
              </span>
            )}
          </div>
        </div>
      )}

      {stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-sm p-3">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Total Files
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {stats.total.toLocaleString()}
              </div>
            </div>
            <div className="bg-card border border-border rounded-sm p-3">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Total Size
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {formatBytes(stats.totalSize)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-sm p-3">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                File Types
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {Object.keys(stats.byType).length}
              </div>
            </div>
            <div className="bg-card border border-border rounded-sm p-3">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Directories
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {rootDirs.length}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-4 space-y-3">
            <h3 className="text-[13px] font-semibold text-foreground">
              File Distribution
            </h3>
            <div className="flex h-6 rounded-sm overflow-hidden border border-border">
              {Object.entries(stats.byType)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([cat, data], i) => {
                  const pct = (data.count / stats.total) * 100;
                  const colors = [
                    "bg-primary",
                    "bg-primary/70",
                    "bg-primary/50",
                    "bg-primary/30",
                    "bg-accent",
                    "bg-muted-foreground/40",
                    "bg-muted-foreground/20",
                    "bg-muted",
                  ];
                  return (
                    <div
                      key={cat}
                      className={`${colors[i % colors.length]} relative group cursor-default`}
                      style={{ width: `${Math.max(1, pct)}%` }}
                      title={`${FILE_CATEGORIES[cat]?.label || "Other"}: ${data.count} files (${pct.toFixed(1)}%)`}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                        {FILE_CATEGORIES[cat]?.label || "Other"}: {data.count}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.byType)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([cat, data]) => (
                  <div
                    key={cat}
                    className="flex items-center gap-1.5 text-[11px]"
                  >
                    <span className="text-primary">{data.icon}</span>
                    <span className="text-foreground font-medium">
                      {FILE_CATEGORIES[cat]?.label || "Other"}
                    </span>
                    <span className="text-muted-foreground">
                      ({data.count})
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-[13px] font-semibold text-foreground">
                File Type Breakdown
              </h3>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Count
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Distribution
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                    Files
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([cat, data]) => (
                    <React.Fragment key={cat}>
                      <tr className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 flex items-center gap-2">
                          <span className="text-primary">{data.icon}</span>
                          <span className="font-medium text-foreground capitalize">
                            {FILE_CATEGORIES[cat]?.label || "Other Files"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-foreground">
                          {data.count.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                          {formatBytes(data.size)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.max(2, (data.count / stats.total) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground w-10 text-right">
                              {((data.count / stats.total) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() =>
                              setOpenCategory((prev) =>
                                prev === cat ? null : cat,
                              )
                            }
                            className="text-[11px] font-semibold text-primary hover:text-primary/80"
                          >
                            {openCategory === cat ? "Hide" : "Show"} 10
                          </button>
                        </td>
                      </tr>
                      {openCategory === cat && (
                        <tr className="bg-muted/10">
                          <td colSpan={5} className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {(filesByType[cat] || []).length === 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  No files captured for this type.
                                </span>
                              )}
                              {(filesByType[cat] || []).map((file) => (
                                <div
                                  key={file.path}
                                  className="px-2 py-1 bg-card border border-border rounded-sm text-[11px] flex items-center gap-2"
                                >
                                  {getFileIcon(file.name)}
                                  <span className="font-mono text-foreground truncate max-w-[200px]">
                                    {file.name}
                                  </span>
                                  <span className="text-muted-foreground truncate max-w-[240px]">
                                    {file.path}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-foreground">
                Scanned Files
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {scannedFiles.length.toLocaleString()} total
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                      File
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                      Path
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                      Open
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scannedFiles.slice(0, fileListLimit).map((f, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-1.5">
                        <button
                          onClick={() => openFile(f)}
                          className="flex items-center gap-1.5 text-left w-full hover:text-primary"
                        >
                          {getFileIcon(f.name)}
                          <span className="font-mono text-foreground truncate max-w-[200px]">
                            {f.name}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-1.5 font-mono text-muted-foreground truncate max-w-[300px]">
                        {f.path}
                      </td>
                      <td className="px-4 py-1.5 text-right font-mono text-muted-foreground">
                        {f.size ? formatBytes(f.size) : "—"}
                      </td>
                      <td className="px-4 py-1.5">
                        <span className="px-1.5 py-0.5 text-[10px] bg-muted rounded-sm text-muted-foreground uppercase">
                          {f.extension || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-right">
                        <button
                          onClick={() => openFile(f)}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scannedFiles.length > 0 && scannedFiles.length > fileListLimit && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
                <span>
                  Showing {fileListLimit.toLocaleString()} of{" "}
                  {scannedFiles.length.toLocaleString()} files
                </span>
                <button
                  onClick={() => setFileListLimit(scannedFiles.length)}
                  className="text-primary hover:text-primary/80 font-semibold text-[11px]"
                >
                  Show all
                </button>
              </div>
            )}
            {scannedFiles.length > 100 &&
              fileListLimit === scannedFiles.length && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
                  <span>
                    Showing all {scannedFiles.length.toLocaleString()} files
                  </span>
                  <button
                    onClick={() =>
                      setFileListLimit(Math.min(100, scannedFiles.length))
                    }
                    className="text-primary hover:text-primary/80 font-semibold text-[11px]"
                  >
                    Collapse to first 100
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
      {(previewLoading || preview || previewError) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold text-foreground">
                  {preview?.name || "Preview"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate max-w-[500px]">
                  {preview?.path ||
                    (previewError ? "Error opening file" : "Loading file...")}
                </div>
              </div>
              <button
                onClick={closePreview}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto text-[12px] bg-background/60 flex-1">
              {previewLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              )}
              {!previewLoading && previewError && (
                <div className="text-destructive text-[12px]">
                  {previewError}
                </div>
              )}
              {!previewLoading && preview && (
                <div className="border border-border rounded-sm bg-card/60 p-3 h-full">
                  {preview.kind === "image" && preview.url && (
                    <div className="flex justify-center">
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="max-h-[60vh] object-contain"
                      />
                    </div>
                  )}
                  {preview.kind === "pdf" && preview.url && (
                    <div className="h-[60vh]">
                      <iframe
                        src={preview.url}
                        title={preview.name}
                        className="w-full h-full border border-border rounded-sm"
                      />
                    </div>
                  )}
                  {preview.kind === "text" && preview.content && (
                    <pre className="text-[12px] whitespace-pre-wrap break-words font-mono">
                      {preview.content}
                    </pre>
                  )}
                  {preview.kind === "unsupported" && !previewError && (
                    <div className="text-muted-foreground">
                      Preview not available for this file type.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
