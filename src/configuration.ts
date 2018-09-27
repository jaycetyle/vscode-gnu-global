import * as vscode from 'vscode';

export enum BoolDefault {
    Enabled,
    Disabled,
    Default
}

export default class GlobalConfiguration {
    private get configurations(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('gnuGlobal');
    }

    private getBoolDefaultOption(name: string): BoolDefault {
        const val = this.configurations.get<string>(name, 'Default');
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
        return this.getBoolDefaultOption('autoUpdate');
    }

    get globalPath(): string | undefined {
        return this.configurations.get<string>('globalPath');
    }
}