use git2::{Repository, BranchType};
use anyhow::Result;
use serde::Serialize;

#[derive(Serialize)]
pub struct BranchInfo {
    pub name: String,
    pub is_remote: bool,
}

pub fn create_branch(repo: &Repository, branch_name: &str) -> Result<()> {
    let reference = repo.head()?;
    let commit = reference.peel_to_commit()?;
    repo.branch(branch_name, &commit, false)?;
    Ok(())
}

pub fn delete_branch(repo: &Repository, branch_name: &str) -> Result<()> {
    let mut branch = repo.find_branch(branch_name, git2::BranchType::Local)?;
    branch.delete()?;
    Ok(())
}

/// Returns all local and remote branches with their type
pub fn list_all_branches(repo: &Repository) -> Result<Vec<BranchInfo>> {
    let mut branches = Vec::new();
    for branch_type in [BranchType::Local, BranchType::Remote] {
        for branch in repo.branches(Some(branch_type))? {
            let (branch, branch_type_actual) = branch?;
            let name = branch.name()?.unwrap_or("").to_string();
            branches.push(BranchInfo {
                name,
                is_remote: branch_type_actual == BranchType::Remote,
            });
        }
    }
    Ok(branches)
}

pub fn checkout_branch(repo: &Repository, branch_name: &str) -> Result<()> {
    let branch = repo.find_branch(branch_name, git2::BranchType::Local)?;
    let reference = branch.get();
    let commit = reference.peel_to_commit()?;
    let object = commit.as_object();
    repo.checkout_tree(object, None)?;
    repo.set_head(reference.name().unwrap())?;
    Ok(())
}

/// Returns the name of the currently checked-out branch (HEAD)
pub fn get_current_branch(repo: &Repository) -> Result<String> {
    let head = repo.head()?;
    if head.is_branch() {
        if let Some(name) = head.shorthand() {
            return Ok(name.to_string());
        }
    }
    Err(anyhow::anyhow!("Not currently on a branch"))
}
