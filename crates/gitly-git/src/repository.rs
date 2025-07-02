use git2::{Repository, Oid, BranchType};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Serialize, Deserialize)]
pub struct CommitInfo {
    pub id: String,
    pub message: String,
    pub author: String,
    pub time: i64,
    pub parents: Vec<String>,
}

/// For commit graph visualization: includes which branches point to this commit
#[derive(Serialize, Deserialize)]
pub struct CommitGraphNode {
    pub id: String,
    pub message: String,
    pub author: String,
    pub time: i64,
    pub parents: Vec<String>,
    pub branches: Vec<String>,
}
/// Checks if the given path is a git repository
pub fn is_git_repo(path: &str) -> bool {
    Repository::open(path).is_ok()
}

/// Opens a git repository at the given path
pub fn open_repo(path: &str) -> Result<Repository> {
    Repository::open(path).map_err(Into::into)
}

/// Initializes a git repository at the given path
pub fn init_git_repo(path: &str) -> Result<()> {
    Repository::init(path)?;
    Ok(())
}

pub fn list_commits(repo: &Repository, branch: Option<&str>) -> Result<Vec<CommitInfo>> {
    let mut commits = Vec::new();

    // Get the reference to walk from (HEAD or a specific branch)
    let reference = match branch {
        Some(branch_name) => repo.find_reference(&format!("refs/heads/{}", branch_name))?,
        None => repo.head()?,
    };
    let oid = reference.target().ok_or_else(|| anyhow::anyhow!("Invalid reference"))?;

    let mut revwalk = repo.revwalk()?;
    revwalk.push(oid)?;

    for oid_result in revwalk {
        let oid = oid_result?;
        let commit = repo.find_commit(oid)?;
        let parents = commit.parent_ids().map(|p| p.to_string()).collect();
        commits.push(CommitInfo {
            id: commit.id().to_string(),
            message: commit.summary().unwrap_or("").to_string(),
            author: commit.author().name().unwrap_or("").to_string(),
            time: commit.time().seconds(),
            parents,
        });
    }

    Ok(commits)
}

/// Returns all commits from all branches, with branch pointers for each commit (for graph visualization)
pub fn list_all_commits_with_refs(repo: &Repository) -> Result<Vec<CommitGraphNode>> {
    let mut seen = HashSet::new();
    let mut commits = HashMap::<Oid, CommitGraphNode>::new();
    let mut branch_map: HashMap<Oid, Vec<String>> = HashMap::new();

    // Collect all local and remote branches
    let mut refs = Vec::new();
    for branch_type in [BranchType::Local, BranchType::Remote] {
        for branch in repo.branches(Some(branch_type))? {
            let (branch, _) = branch?;
            if let Some(oid) = branch.get().target() {
                let name = branch.name()?.unwrap_or("").to_string();
                refs.push((oid, name.clone()));
                branch_map.entry(oid).or_default().push(name);
            }
        }
    }

    // Walk all commits reachable from all branch heads
    let mut revwalk = repo.revwalk()?;
    for (oid, _) in &refs {
        revwalk.push(*oid)?;
    }

    for oid_result in revwalk {
        let oid = oid_result?;
        if seen.contains(&oid) {
            continue;
        }
        seen.insert(oid);

        let commit = repo.find_commit(oid)?;
        let parents = commit.parent_ids().map(|p| p.to_string()).collect();
        let mut branches = branch_map.get(&oid).cloned().unwrap_or_default();

        // Also check if any refs (branches) point to this commit
        for (ref_oid, ref_name) in &refs {
            if *ref_oid == oid && !branches.contains(ref_name) {
                branches.push(ref_name.clone());
            }
        }

        commits.insert(
            oid,
            CommitGraphNode {
                id: oid.to_string(),
                message: commit.summary().unwrap_or("").to_string(),
                author: commit.author().name().unwrap_or("").to_string(),
                time: commit.time().seconds(),
                parents,
                branches,
            },
        );
    }

    // Return as Vec sorted by commit time descending (most recent first)
    let mut commit_vec: Vec<_> = commits.into_values().collect();
    commit_vec.sort_by(|a, b| b.time.cmp(&a.time));
    Ok(commit_vec)
}
