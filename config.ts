//! Constants to configure for your mod
//! YOU WILL NEED TO CHANGE MOST OF THESE

// where did you install Unreal Engine
export const ENGINE_INSTALL = "D:\\unreal\\UE_4.23"

// Where is your Astro Project located
export const PROJECT_FOLDER = "D:\\unreal"
// (you don't jave to change this one)
export const PROJECT_NAME = "Astro"

// Information about your mod
export const MOD_ID = "ExampleMod"
export const MOD_NAME = "Example Mod"
export const MOD_VERSION = "0.1.0"

// your mod author tag
export const MOD_AUTHOR = "ExampleModder"

// Note: MOD_AUTHOR and MOD_ID also make up the paths for where your mod files are in the unreal editor

// Basically where the distribuatable .pak will be put and also some other files (should be empty)
export const MOD_WORKING_DIR = "D:\\astroneerModding\\ExampleMod"

// integrating details
export const PERSISTENT_ACTORS: string[] = [
    "MyPersistentActor"
]
export const ATTTACH_PLAYER_CONTROLLER: string[] = [
    "MyPlayerControllerComponent"
]

// where the mod should be installed to
// path: the folder to /Paks for mods to be loded
// installDir: where the game is installed
export const INSTALL_LOCATIONS: { path: string, installDir: string }[] = [
    {
        path: "C:\\Users\\{yourname}\\AppData\\Local\\Astro\\Saved\\Paks",
        installDir: "D:\\SteamLibrary\\steamapps\\common\\ASTRONEER"
    },
    {
        path: "D:\\SteamLibrary\\steamapps\\common\\ASTRONEER Dedicated Server\\Astro\\Saved\\Paks",
        installDir: "D:\\SteamLibrary\\steamapps\\common\\ASTRONEER Dedicated Server"
    }
]
