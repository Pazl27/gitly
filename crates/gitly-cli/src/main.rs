use std::env;
use std::path::Path;
use std::process::Command;
use clap::Parser;

#[derive(Parser)]
#[command(name = "gitly-cli")]
#[command(about = "CLI tool to launch Gitly", long_about = None)]
struct Cli {}

fn main() {
    let _cli = Cli::parse();

    // 1. Check for environment variable
    let gui_path = env::var("GITLY_PATH").ok()
        .or_else(|| {
            // 2. Fallback to platform-specific default path
            #[cfg(target_os = "windows")]
            let default_path = r"C:\Program Files\Gitly\gitly.exe";
            #[cfg(target_os = "macos")]
            let default_path = "/Applications/Gitly.app/Contents/MacOS/Gitly";
            #[cfg(target_os = "linux")]
            let default_path = "/usr/local/bin/gitly";

            if Path::new(default_path).exists() {
                Some(default_path.to_string())
            } else {
                None
            }
        });

    match gui_path {
        Some(path) => {
            // 3. Launch the GUI in a non-blocking way, platform-specific if needed
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                const CREATE_NEW_CONSOLE: u32 = 0x00000010;
                match Command::new(path)
                    .creation_flags(CREATE_NEW_CONSOLE)
                    .spawn()
                {
                    Ok(_) => println!("Launched Gitly!"),
                    Err(e) => eprintln!("Failed to launch: {e}"),
                }
            }
            #[cfg(not(target_os = "windows"))]
            {
                match Command::new(path).spawn() {
                    Ok(_) => println!("Launched Gitly!"),
                    Err(e) => eprintln!("Failed to launch: {e}"),
                }
            }
        }
        None => {
            eprintln!("Could not find the Gitly executable. \
                Set GITLY_PATH or install it to the standard location for your OS.");
        }
    }
}
