import * as vscode from 'vscode';

export enum BoolDefault {
    Enabled = "Enabled",
    Disabled = "Disabled",
    Default = "Default"
}

export enum BoolOption {
    Enabled = "Enabled",
    Disabled = "Disabled"
}

export default class GlobalConfiguration {
    windowScopeSetters: (() => void ) [] = [];

    applyWindowScopeConfigs() {
        for (let set of this.windowScopeSetters) {
            try {
                set();
            } catch (e) {
                console.error(e);
            }
        }
    }

    getConfiguration(resource?: vscode.Uri | undefined): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('gnuGlobal', resource);
    }

    /* resource scope configurations */
    getAutoUpdateMode(path: vscode.Uri): BoolDefault {
        const ret = this.getConfiguration(path).get<BoolDefault>('autoUpdate', BoolDefault.Default);
        if (ret in BoolDefault) {
            return ret;
        } else {
            return BoolDefault.Default;
        }
    }

    getCompletionMode(path: vscode.Uri): BoolOption {
        const ret = this.getConfiguration(path).get<BoolOption>('completion', BoolOption.Enabled);
        if (ret in BoolOption) {
            return ret;
        } else {
            return BoolOption.Enabled;
        }
    }
}
