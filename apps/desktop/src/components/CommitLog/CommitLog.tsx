import React from "react";

export interface CommitInfo {
  id: string;
  message: string;
  author: string;
  time: number;
  parents: string[];
}

interface CommitLogProps {
  branchName: string;
  commits: CommitInfo[];
  loading?: boolean;
  error?: string | null;
}

function formatDate(ts: number) {
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

const CommitLog: React.FC<CommitLogProps> = ({
  branchName,
  commits,
  loading = false,
  error = null,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-xl font-bold mb-4">
        Commit Log for <span className="text-blue-600">{branchName}</span>
      </h2>
      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-400">
          Loading commits...
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      {!loading && !error && commits.length === 0 && (
        <div className="text-slate-400 py-8 text-center">
          No commits found for this branch.
        </div>
      )}
      {!loading && !error && commits.length > 0 && (
        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
          <ol className="relative border-l-2 border-blue-200">
            {commits.map((commit, idx) => (
              <li key={commit.id} className="mb-8 ml-4">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 border-2 border-white" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {commit.id.slice(0, 7)}
                    </span>
                    <span className="ml-2 font-semibold text-slate-800">
                      {commit.message}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 sm:mt-0 sm:ml-4">
                    {formatDate(commit.time)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  <span>by {commit.author}</span>
                  {commit.parents.length > 1 && (
                    <span className="ml-2 text-xs text-slate-400">
                      Merge commit
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default CommitLog;