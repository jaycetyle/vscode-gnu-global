import ExecutableBase from './executableBase'
import Configuration from '../configuration'
import { BoolOption, GtagsSkipSymlinkOption } from '../configuration'
import * as vscode from 'vscode';

export default class Gtags extends ExecutableBase {
    constructor(configuration: Configuration) {
        super(configuration);
    }

    get executable(): string {
        return this.configuration.getGtagsExecutable();
    }

    rebuildTags(folder: vscode.Uri) {
        var env: any = {};
        var opt = [];

        if (this.configuration.getGtagsForceCpp(folder) === BoolOption.Enabled) {
            env.GTAGSFORCECPP = 1;
        }

        if (this.configuration.getObjDirPrefix() !== "") {
            env.GTAGSOBJDIRPREFIX = this.configuration.getObjDirPrefix();
            opt.push('-O');
        }

        if (this.configuration.getGtagsSkipSymlink(folder) === GtagsSkipSymlinkOption.File) {
            opt.push('--skip-symlink=f');
        } else if (this.configuration.getGtagsSkipSymlink(folder) === GtagsSkipSymlinkOption.Directory) {
            opt.push('--skip-symlink=d');
        } else if (this.configuration.getGtagsSkipSymlink(folder) === GtagsSkipSymlinkOption.All) {
            opt.push('--skip-symlink=a');
        }

        this.execute(opt, folder.fsPath, env);
    }
}
