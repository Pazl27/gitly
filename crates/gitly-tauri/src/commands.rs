use gitly_git::{repository::is_git_repo, repository::init_git_repo};
use gitly_git::{repository::open_repo, branches::list_all_branches, branches::BranchInfo};
use gitly_git::branches::get_current_branch;
use gitly_git::repository::{list_commits, CommitInfo, list_all_commits_with_refs, CommitGraphNode};

#[tauri::command]
pub fn tauri_is_git_repo(path: &str) -> bool {
    is_git_repo(path)
}

#[tauri::command]
pub fn tauri_init_git_repo(path: &str) -> Result<(), String> {
    init_git_repo(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tauri_list_branches(path: &str) -> Result<Vec<BranchInfo>, String> {
    let repo = open_repo(path).map_err(|e| e.to_string())?;
    list_all_branches(&repo).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tauri_get_current_branch(path: &str) -> Result<String, String> {
    let repo = open_repo(path).map_err(|e| e.to_string())?;
    get_current_branch(&repo).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tauri_list_all_commits_with_refs(path: &str) -> Result<Vec<CommitGraphNode>, String> {
    let repo = open_repo(path).map_err(|e| e.to_string())?;
    list_all_commits_with_refs(&repo).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tauri_list_commits(path: &str, branch: Option<&str>) -> Result<Vec<CommitInfo>, String> {
    let repo = open_repo(path).map_err(|e| e.to_string())?;
    list_commits(&repo, branch).map_err(|e| e.to_string())
}
