import React, { useState, useEffect } from "react";
import RepoListSidebar from "../components/PreviousRepos";
import { open, confirm, message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

const RECENT_REPOS_KEY = "recentRepos";

function Welcome() {
  const [repos, setRepos] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load repos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_REPOS_KEY);
    if (stored) setRepos(JSON.parse(stored));
  }, []);

  // Save repos to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(repos));
  }, [repos]);

  const addRepo = (repo: string) => {
    setRepos((prev) => {
      // Avoid duplicates, most recent first
      const filtered = prev.filter((r) => r !== repo);
      return [repo, ...filtered];
    });
  };

  const handleSelectRepo = (repo: string) => {
    navigate(`/repo?path=${encodeURIComponent(repo)}`);
  };

  // Handler for the Open Repo button
  const handleOpenRepo = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select a Git repository or folder",
    });

    if (!selected || typeof selected !== "string") {
      await message("No folder selected.", { title: "Info", kind: "info" });
      return;
    }

    let isRepo = false;
    try {
      isRepo = await invoke<boolean>("tauri_is_git_repo", { path: selected });
    } catch (e) {
      await message("Failed to check if folder is a git repo.", { title: "Error", kind: "error" });
      return;
    }

    if (isRepo) {
      await message("This is a valid Git repository!", { title: "Success", kind: "info" });
      addRepo(selected);
      navigate(`/repo?path=${encodeURIComponent(selected)}`);
      return;
    }

    const confirmInit = await confirm(
      "This folder is not a Git repository. Do you want to initialize it as one?",
      {
        title: "Initialize Git Repository",
        kind: "info",
        okLabel: "Initialize",
        cancelLabel: "Cancel",
      }
    );

    if (!confirmInit) {
      await message("Operation cancelled.", { title: "Info", kind: "info" });
      return;
    }

    try {
      await invoke("tauri_init_git_repo", { path: selected });
      await message("Initialized a new Git repository!", { title: "Success", kind: "info" });
      addRepo(selected);
      navigate(`/repo?path=${encodeURIComponent(selected)}`);
    } catch (e) {
      await message("Failed to initialize git repository.", { title: "Error", kind: "error" });
    }
  };

  // Handler for the Create Repo button (for now, just open the dialog)
  const handleCreateRepo = async () => {
    // You can use the same logic as handleOpenRepo, or customize as needed
    await handleOpenRepo();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <RepoListSidebar repos={repos} onSelect={handleSelectRepo} />
      <main className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#3b82f6"/>
              <path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4"/>
            </svg>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gitly</h1>
          </div>
          <div className="mb-8 text-center">
            <p className="text-slate-600 text-lg">
              Gitly is your simple, modern Git client.<br />
              Manage your repositories with ease.<br />
              Use the sidebar to browse your imported repositories, or get started below.
            </p>
          </div>
          <div className="flex gap-6">
            <button
              className="group flex flex-col items-center focus:outline-none"
              onClick={handleCreateRepo}
            >
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 group-hover:bg-blue-600 transition">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 8v8M8 12h8"/>
                </svg>
              </span>
              <span className="mt-2 text-blue-700 font-semibold group-hover:underline">Create Repo</span>
            </button>
            <button
              className="group flex flex-col items-center focus:outline-none"
              onClick={handleOpenRepo}
            >
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 group-hover:bg-slate-300 transition">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="white"/>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M8 7V5a4 4 0 0 1 8 0v2"/>
                </svg>
              </span>
              <span className="mt-2 text-slate-700 font-semibold group-hover:underline">Open Repo</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Welcome;
