import Configuration from '../configuration'

const spawnSync = require('child_process').spawnSync;

export default class ExecutableBase {
    executable: string; // Executable name/path
    configuration: Configuration;

    constructor(executable: string, configuration: Configuration) {
        this.executable = executable;
        this.configuration = configuration;
    }

    /* Execute 'gtags args' and return stdout with line split */
    protected execute(args: string[],
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
