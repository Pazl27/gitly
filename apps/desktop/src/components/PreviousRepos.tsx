import React from "react";

interface RepoListSidebarProps {
  repos: string[];
  onSelect: (repo: string) => void;
}

function getRepoName(path: string) {
  if (!path) return "";
  const parts = path.replace(/[/\\]+$/, "").split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

const RepoListSidebar: React.FC<RepoListSidebarProps> = ({ repos, onSelect }) => (
  <aside className="w-64 bg-white h-full shadow-xl border-r border-slate-100 flex flex-col p-0">
    <div className="px-6 py-5 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Repositories</h2>
    </div>
    <ul className="flex-1 overflow-y-auto py-2">
      {repos.length === 0 ? (
        <li className="text-slate-400 px-6 py-4 text-sm">No repositories yet.</li>
      ) : (
        repos.map((repo) => (
          <li key={repo}>
            <button
              className="w-full text-left px-6 py-3 rounded-none hover:bg-blue-50 transition flex flex-col items-start group"
              onClick={() => onSelect(repo)}
            >
              <span className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">{getRepoName(repo)}</span>
              <span className="text-xs text-slate-400 truncate">{repo}</span>
            </button>
          </li>
        ))
      )}
    </ul>
  </aside>
);

export default RepoListSidebar;