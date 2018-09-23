import * as vscode from 'vscode';

const globalConfigSection = 'gnuglobal'

export enum BoolDefault {
    Enabled,
    Disabled,
    Default
}

export default class GlobalConfiguration {

    private getBoolDefaultOption(name: string): BoolDefault {
        const val = vscode.workspace.getConfiguration(globalConfigSection).get<string>(name, 'Default');
        switch (val) {
        case 'Enabled':
            return BoolDefault.Enabled;
        case 'Disabled':
            return BoolDefault.Disabled;
        default:
            return BoolDefault.Default;
        }
    }

    get autoUpdate(): BoolDefault {
        return this.getBoolDefaultOption('autoupdate');
    }
}