// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::tauri_is_git_repo,
            commands::tauri_init_git_repo,
            commands::tauri_list_branches,
            commands::tauri_list_commits,
            commands::tauri_get_current_branch,
            commands::tauri_list_all_commits_with_refs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
