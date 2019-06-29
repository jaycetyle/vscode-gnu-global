import ExecutableBase from './executableBase'
import Configuration, { BoolOption } from '../configuration'
import * as vscode from 'vscode';

export default class Gtags extends ExecutableBase {
    constructor(configuration: Configuration) {
        super(configuration);
    }

    get executable(): string {
        return this.configuration.getGtagsExecutable();
    }

    rebuildTags(folder: vscode.Uri) {
        var env;
        if (this.configuration.getGtagsForceCpp(folder) === BoolOption.Enabled) {
            env = {
                'GTAGSFORCECPP': 1,
                'GTAGSOBJDIRPREFIX': this.configuration.getObjDirPrefix()
            };
        } else {
            env = {
                'GTAGSOBJDIRPREFIX': this.configuration.getObjDirPrefix()
            };
        }
        let opt = env.GTAGSOBJDIRPREFIX === "" ? [] : ['-O'];
        this.execute(opt, folder.fsPath, env);
    }
}
