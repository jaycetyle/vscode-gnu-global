const spawnSync = require('child_process').spawnSync;

export default class Gtags {
    executable: string;         // Executable name. Default: gtags

    constructor(executable: string = 'gtags') {
        this.executable = executable;
    }

    rebuildTags(folder: string) {
        this.execute([], folder);
    }

    /* Execute 'gtags args' and return stdout with line split */
    private execute(args: string[],
                    cwd: string|undefined = undefined,
                    env: any = null)
                    : string[] {
        const options = {
            cwd: cwd,
            env: env
        };

        let sync = spawnSync(this.executable, args, options);
        if (sync.error) {
            throw sync.error;
        }
        return sync.stdout.toString().split(/\r?\n/);
    }
}
