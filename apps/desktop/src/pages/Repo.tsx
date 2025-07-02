import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import RepoSidebar from "../components/RepoSidebar";
import { invoke } from "@tauri-apps/api/core";
import CommitLog, { CommitInfo } from "../components/CommitLog/CommitLog";
// import CommitGraphModal from "../components/CommitGraph/CommitGraphModal";

function getRepoName(path: string) {
  if (!path) return "";
  const parts = path.replace(/[/\\]+$/, "").split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

interface BranchInfo {
  name: string;
  is_remote: boolean;
}

const Repo: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const repoPath = params.get("path") || "";

  const [selectedWorkspace, setSelectedWorkspace] = useState("working-copy");
  const [localBranches, setLocalBranches] = useState<string[]>([]);
  const [remoteBranches, setRemoteBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);

  const [commitLog, setCommitLog] = useState<CommitInfo[]>([]);
  const [commitLogLoading, setCommitLogLoading] = useState(false);
  const [commitLogError, setCommitLogError] = useState<string | null>(null);

  // For commit graph modal
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [graphModalBranch, setGraphModalBranch] = useState<string | null>(null);

  useEffect(() => {
    if (!repoPath) return;
    invoke<BranchInfo[]>("tauri_list_branches", { path: repoPath })
      .then((branches) => {
        setLocalBranches(branches.filter(b => !b.is_remote).map(b => b.name));
        setRemoteBranches(branches.filter(b => b.is_remote).map(b => b.name));
      })
      .catch(() => {
        setLocalBranches([]);
        setRemoteBranches([]);
      });
  }, [repoPath]);

  // Fetch current branch name when repoPath changes or when switching to history
  useEffect(() => {
    if (!repoPath || selectedWorkspace !== "history") {
      setCurrentBranch(null);
      return;
    }
    invoke<string>("tauri_get_current_branch", { path: repoPath })
      .then((branch) => setCurrentBranch(branch))
      .catch(() => setCurrentBranch(null));
  }, [repoPath, selectedWorkspace]);

  // Fetch commit log for current branch in history view
  useEffect(() => {
    if (!repoPath || !currentBranch || selectedWorkspace !== "history") {
      setCommitLog([]);
      setCommitLogError(null);
      setCommitLogLoading(false);
      return;
    }
    setCommitLogLoading(true);
    setCommitLogError(null);
    invoke<CommitInfo[]>("tauri_list_commits", { path: repoPath, branch: currentBranch })
      .then((commits) => {
        setCommitLog(commits);
        setCommitLogLoading(false);
      })
      .catch((err) => {
        setCommitLog([]);
        setCommitLogError(typeof err === "string" ? err : "Failed to load commits");
        setCommitLogLoading(false);
      });
  }, [repoPath, currentBranch, selectedWorkspace]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <RepoSidebar
        branches={localBranches}
        remotes={remoteBranches}
        selectedWorkspace={selectedWorkspace}
        onSelectWorkspace={setSelectedWorkspace}
        // Show graph modal when a branch is clicked
        onBranchGraphClick={(branch) => {
          setGraphModalBranch(branch);
          setGraphModalOpen(true);
        }}
      />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center w-full max-w-4xl">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">
            {getRepoName(repoPath)}
          </h1>
          <div className="text-xs text-slate-400 mb-6">{repoPath}</div>
          <div className="w-full">
            {selectedWorkspace === "working-copy" && (
              <div className="text-lg text-slate-700">
                Working Copy view (coming soon)
              </div>
            )}
            {selectedWorkspace === "stash" && (
              <div className="text-lg text-slate-700">
                Stash view (coming soon)
              </div>
            )}
            {selectedWorkspace === "history" && currentBranch && (
              <CommitLog
                branchName={currentBranch}
                commits={commitLog}
                loading={commitLogLoading}
                error={commitLogError}
              />
            )}
            {selectedWorkspace === "history" && !currentBranch && (
              <div className="text-slate-400 text-center py-10">
                Could not determine current branch.
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Overlay clickable branch list */}
      <div className="fixed left-0 top-0 h-full w-64 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Patch RepoSidebar to accept onBranchClick */}
        </div>
      </div>
      {/* Commit Graph Modal */}
      {/* {graphModalOpen && graphModalBranch && (
        <CommitGraphModal
          repoPath={repoPath}
          branchName={graphModalBranch}
          open={graphModalOpen}
          onClose={() => setGraphModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default Repo;
