import * as path from "https://deno.land/std@0.103.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.103.0/fs/mod.ts";
import * as colors from "https://deno.land/std@0.103.0/fmt/colors.ts";

//! load config
import * as c from "./config.ts";

//! cook the files
console.log(colors.bgYellow(colors.black("Cooking...")))
const projectFile = path.join(c.PROJECT_FOLDER, c.PROJECT_NAME, c.PROJECT_NAME + ".uproject").replaceAll("\\", "/")
const cmdParams = `
-ScriptsForProject=${projectFile}
BuildCookRun -nocompile -nocompileeditor -installed -nop4
-project=${projectFile}
-cook -skipstage
-ue4exe=${path.join(c.ENGINE_INSTALL, "Engine", "Binaries", "Win64", "UE4Editor-Cmd.exe")}
-targetplatform=Win64 -utf8out
`.replaceAll("\n", " ").split(" ")

const cookProcess = Deno.run({
    cmd: [
        path.join(c.ENGINE_INSTALL, "Engine", "Build", "BatchFiles", "RunUAT.bat"),
        ...cmdParams
    ],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit"
})
console.log(await cookProcess.status())

//! ensure proper clean folders
console.log(colors.bgYellow(colors.black("Assembling mod...")))
const modFileName = `000-${c.MOD_ID}-${c.MOD_VERSION}_P`
if (fs.existsSync(path.join(c.MOD_WORKING_DIR, modFileName))) {
    await Deno.remove(path.join(c.MOD_WORKING_DIR, modFileName), { recursive: true })
}
const assetFolder = path.join(c.MOD_WORKING_DIR, modFileName, "Astro", "Content", c.MOD_AUTHOR, c.MOD_ID)
// ensure structure
fs.ensureDirSync(assetFolder)
// but remove final folder for now
Deno.removeSync(assetFolder)

//! copy over files
await fs.copy(
    path.join(c.PROJECT_FOLDER, c.PROJECT_NAME, "Saved", "Cooked", "WindowsNoEditor", c.PROJECT_NAME, "Content", c.MOD_AUTHOR, c.MOD_ID),
    assetFolder)

//! generate metadata.json
console.log(colors.bgYellow(colors.black("Writing Metadata...")))
const metadata = {
    "name": c.MOD_NAME,
    "mod_id": c.MOD_ID,
    "author": c.MOD_AUTHOR,
    "version": c.MOD_VERSION,
    "sync": "serverclient",
    "persistent_actors":
        c.PERSISTENT_ACTORS.map(a => `/Game/${c.MOD_AUTHOR}/${c.MOD_ID}/${a}`),
    "linked_actor_components": {
        "/Game/Globals/PlayControllerInstance":
            c.ATTTACH_PLAYER_CONTROLLER.map(a => `/Game/${c.MOD_AUTHOR}/${c.MOD_ID}/${a}`)
    }
}
console.log(metadata)
await Deno.writeTextFile(path.join(c.MOD_WORKING_DIR, modFileName, "metadata.json"), JSON.stringify(metadata))

//! pack using unreal pak
console.log(colors.bgYellow(colors.black("Packing...")))
// create reponsefile
await Deno.writeTextFile(path.join(c.MOD_WORKING_DIR, "filelist.txt"),
    `"${path.join(c.MOD_WORKING_DIR, modFileName, "*.*")}" "..\\..\\..\\*.*"\n`)

// run unreal pak
const pakProcess = Deno.run({
    cmd: [
        path.join(c.ENGINE_INSTALL, "Engine", "Binaries", "Win64", "UnrealPak.exe"),
        path.join(c.MOD_WORKING_DIR, modFileName + ".pak"),
        `-Create=${path.join(c.MOD_WORKING_DIR, "filelist.txt")}`,
        "-compress"
    ],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit"
})
console.log(await pakProcess.status())

//! install and integrate mod
console.log(colors.bgYellow(colors.black("Installing and Integrating...")))
for (const loc of c.INSTALL_LOCATIONS) {
    // make sure the dir where we are working is empty
    await fs.emptyDir(loc.path)

    // copy over the mod file
    await Deno.copyFile(path.join(c.MOD_WORKING_DIR, modFileName + ".pak"),
        path.join(loc.path, modFileName + ".pak"))

    // TODO: fix this retarded work around
    // write to a .bat file te integrator command
    await Deno.writeTextFile(path.join(Deno.cwd(), "runIntegrator.bat"),
        `${path.join(Deno.cwd(), "integrator", "ModIntegrator.exe")} "${loc.path}" "${path.join(loc.installDir, "Astro", "Content", "Paks")}"`)

    // run integrator (via .bat file)
    const integrateProcess = Deno.run({
        cmd: [path.join(Deno.cwd(), "runIntegrator.bat")],
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit"
    })
    console.log(await integrateProcess.status())

    // remove stupid .bat file
    Deno.remove(path.join(Deno.cwd(), "runIntegrator.bat"))
}

console.log(colors.bgGreen(colors.black("Done!")))
