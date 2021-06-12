import Configuration from '../configuration';
import * as iconv from 'iconv-lite';
import Logger from '../logger';

const spawnSync = require('child_process').spawnSync;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default abstract class ExecutableBase {
    configuration: Configuration;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
    }

    protected abstract get executable(): string;

    /* Execute 'executable args' and return stdout with line split */
    protected execute(args: string[],
                      cwd: string|undefined = undefined,
                      env: any = {})
                      : string[] {
        /* default add the PATH to the env */
        env = {
            ...env,
            ...process.env
        };

        const options = {
            cwd: cwd,
            env: env,
            encoding: 'binary'
        };

        console.log(this.executable + " " + args.join(' ') + "\n");

        let sync = spawnSync(this.executable, args, options);
        if (sync.error) {
            throw sync.error;
        } else if (0 !== sync.status) {
            throw sync.stderr.toString();
        }

        Logger.info(this.executable + " " + args + "\n" + sync.stdout);
        console.log(sync.stdout);

        const encoding = this.configuration.encoding.get();
        return iconv.decode(Buffer.from(sync.stdout, 'binary'), encoding).split(/\r?\n/);
    }

    protected async execute_async(args: string[],
        cwd: string|undefined = undefined,
        env: any = {}
        ) : Promise<string[]>
    {
        /* default add the PATH to the env */
        env = {
            ...env,
            ...process.env
        };

        const options = {
            cwd: cwd,
            env: env,
            encoding: 'binary',
            maxBuffer: 2*1024*1024
        };

        const {stdout, stderr} = await exec(this.executable + ' ' + args.join(' '), options);
        if (stderr) {
            console.log("stderr: " + stderr);
        }

        const encoding = this.configuration.encoding.get();
        return iconv.decode(Buffer.from(stdout, 'binary'), encoding).split(/\r?\n/);
    }
}
