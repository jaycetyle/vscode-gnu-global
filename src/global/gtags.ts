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
        if (this.configuration.getGtagsForceCpp(folder) === BoolOption.Enabled) {
            this.execute([], folder.fsPath, { GTAGSFORCECPP: 1 });
        } else {
            this.execute([], folder.fsPath);
        }
    }
}
