import Configuration from '../configuration'

const spawnSync = require('child_process').spawnSync;

export default abstract class ExecutableBase {
    configuration: Configuration;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
    }

    protected abstract get executable(): string;

    /* Execute 'executable args' and return stdout with line split */
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
        } else if (0 != sync.status) {
            throw sync.stderr.toString();
        }
        return sync.stdout.toString().split(/\r?\n/);
    }
}
