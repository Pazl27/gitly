import React, { useState } from "react";

interface RepoSidebarProps {
  branches: string[];
  remotes: string[];
  selectedWorkspace: string;
  onSelectWorkspace: (section: string) => void;
  onBranchGraphClick?: (branch: string) => void;
}

const workspaceSections = [
  {
    key: "working-copy",
    label: "Working Copy",
    icon: (selected: boolean) => (
      <svg className={`w-5 h-5 mr-2 ${selected ? "text-white" : "text-blue-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" fill={selected ? "currentColor" : "none"} />
        <path d="M8 12h8" stroke={selected ? "white" : "currentColor"} strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "History",
    icon: (selected: boolean) => (
      <svg className={`w-5 h-5 mr-2 ${selected ? "text-white" : "text-blue-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" fill={selected ? "currentColor" : "none"} />
        <path d="M12 8v4l3 3" stroke={selected ? "white" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "stash",
    label: "Stash",
    icon: (selected: boolean) => (
      <svg className={`w-5 h-5 mr-2 ${selected ? "text-white" : "text-blue-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="8" ry="4" stroke="currentColor" fill={selected ? "currentColor" : "none"} />
        <ellipse cx="12" cy="12" rx="4" ry="2" stroke={selected ? "white" : "currentColor"} fill="none" />
      </svg>
    ),
  },
];

const branchIcon = () => (
  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M6 3v12a6 6 0 0 0 6 6h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    <circle cx="6" cy="3" r="2" />
    <circle cx="18" cy="21" r="2" />
  </svg>
);

const remoteIcon = () => (
  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const ArrowIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-4 h-4 mr-1 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RepoSidebar: React.FC<RepoSidebarProps> = ({
  branches,
  remotes,
  selectedWorkspace,
  onSelectWorkspace,
  onBranchGraphClick,
}) => {
  const [showLocalBranches, setShowLocalBranches] = useState(true);
  const [showRemoteBranches, setShowRemoteBranches] = useState(false);
  const [showRemotes, setShowRemotes] = useState(true);
  const [search, setSearch] = useState("");

  // Open remote branches section when searching, close when cleared
  React.useEffect(() => {
    if (search.length > 0) {
      setShowRemoteBranches(true);
    } else {
      setShowRemoteBranches(false);
    }
  }, [search]);

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-100 shadow-xl flex flex-col py-6 px-3 overflow-y-auto overflow-x-hidden">
      {/* Workspace Section */}
      <div>
        <h3 className="uppercase text-xs font-semibold text-slate-400 mb-2 px-2 tracking-widest">Workspace</h3>
        <div className="flex flex-col gap-1 mb-4">
          {workspaceSections.map((section) => {
            const selected = selectedWorkspace === section.key;
            return (
              <button
                key={section.key}
                className={`flex items-center px-3 py-2 rounded-lg text-left transition
                  ${selected
                    ? "bg-blue-500 text-white font-semibold shadow-inner"
                    : "hover:bg-slate-100 text-slate-800"}
                `}
                onClick={() => onSelectWorkspace(section.key)}
              >
                {section.icon(selected)}
                <span className={`text-sm ${selected ? "text-white" : "text-slate-900"}`}>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="border-t border-slate-200 my-2" />
      {/* Branches Section */}
      <div className="mt-2">
        <div
          className="flex items-center cursor-pointer select-none px-2"
          onClick={() => setShowLocalBranches((v) => !v)}
        >
          <ArrowIcon open={showLocalBranches} />
          <h3 className="uppercase text-xs font-semibold text-slate-400 py-2 tracking-widest flex-1">Branches</h3>
        </div>
        {showLocalBranches && (
          <ul className="flex flex-col gap-1 mb-2">
            {branches.filter(branch => branch.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
              <li className="text-slate-300 px-3 py-1 text-xs">No local branches</li>
            ) : (
              branches
                .filter(branch => branch.toLowerCase().includes(search.toLowerCase()))
                .map((branch) => (
                  <li key={branch}>
                    <button
                      type="button"
                      className="flex items-center px-3 py-1 rounded text-slate-700 hover:bg-blue-100 cursor-pointer w-full text-left"
                      onClick={() => onBranchGraphClick && onBranchGraphClick(branch)}
                    >
                      {branchIcon()}
                      <span className="text-sm text-slate-900">{branch}</span>
                    </button>
                  </li>
                ))
            )}
          </ul>
        )}
        <div
          className="flex items-center cursor-pointer select-none px-2"
          onClick={() => setShowRemoteBranches((v) => !v)}
        >
          <ArrowIcon open={showRemoteBranches} />
          <h4 className="uppercase text-xs font-semibold text-slate-400 py-2 tracking-widest flex-1">Remote Branches</h4>
        </div>
        {showRemoteBranches && (
          <ul className="flex flex-col gap-1">
            {remotes.filter(remote => remote.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
              <li className="text-slate-300 px-3 py-1 text-xs">No remote branches</li>
            ) : (
              remotes
                .filter(remote => remote.toLowerCase().includes(search.toLowerCase()))
                .map((remote) => (
                  <li key={remote}>
                    <button
                      type="button"
                      className="flex items-center px-3 py-1 rounded text-slate-700 hover:bg-blue-100 cursor-pointer w-full text-left"
                      onClick={() => onBranchGraphClick && onBranchGraphClick(remote)}
                    >
                      {remoteIcon()}
                      <span className="text-sm text-slate-900">{remote}</span>
                    </button>
                  </li>
                ))
            )}
          </ul>
        )}
      </div>
      <div className="border-t border-slate-200 my-2" />
      {/* Remotes Section */}
      <div className="mt-2">
        <div
          className="flex items-center cursor-pointer select-none px-2"
          onClick={() => setShowRemotes((v) => !v)}
        >
          <ArrowIcon open={showRemotes} />
          <h4 className="uppercase text-xs font-semibold text-slate-400 py-2 tracking-widest flex-1">Remotes</h4>
        </div>
      </div>
      {/* Filer */}
      <div className="mt-auto pt-4">
        <input
          type="text"
          className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          placeholder="Filer"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
    </aside>
  );
};

export default RepoSidebar;
