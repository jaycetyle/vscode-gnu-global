import ExecutableBase from './executableBase'
import Configuration from '../configuration'
import { BoolOption, GtagsSkipSymlinkOption } from '../configuration'
import * as vscode from 'vscode';

export default class Gtags extends ExecutableBase {
    constructor(configuration: Configuration) {
        super(configuration);
    }

    get executable(): string {
        return this.configuration.gtagsExecutable.get();
    }

    rebuildTags(folder: vscode.Uri) {
        var env: any = {};
        var opt = [];

        if (this.configuration.gtagsForceCpp.get(folder) === BoolOption.Enabled) {
            env.GTAGSFORCECPP = 1;
        }

        if (this.configuration.objDirPrefix.get() !== "") {
            env.GTAGSOBJDIRPREFIX = this.configuration.objDirPrefix.get();
            opt.push('-O');
        }

        if (this.configuration.gtagsSkipSymlink.get(folder) === GtagsSkipSymlinkOption.File) {
            opt.push('--skip-symlink=f');
        } else if (this.configuration.gtagsSkipSymlink.get(folder) === GtagsSkipSymlinkOption.Directory) {
            opt.push('--skip-symlink=d');
        } else if (this.configuration.gtagsSkipSymlink.get(folder) === GtagsSkipSymlinkOption.All) {
            opt.push('--skip-symlink=a');
        }

        this.execute(opt, folder.fsPath, env);
    }
}
