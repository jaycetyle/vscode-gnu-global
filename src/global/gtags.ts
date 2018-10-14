import ExecutableBase from './executableBase'
import Configuration, { BoolOption } from '../configuration'
import * as vscode from 'vscode';

export default class Gtags extends ExecutableBase {
    constructor(configuration: Configuration) {
        super('gtags', configuration);
    }

    rebuildTags(folder: string) {
        if (this.configuration.getGtagsForceCpp(vscode.Uri.parse(folder)) === BoolOption.Enabled) {
            this.execute([], folder, { GTAGSFORCECPP: 1 });
        } else {
            this.execute([], folder);
        }
    }
}
