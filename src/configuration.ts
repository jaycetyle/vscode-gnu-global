import * as vscode from 'vscode';

export enum BoolDefault {
    Enabled,
    Disabled,
    Default
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
        return this.getConfiguration(path).get<BoolDefault>('autoUpdate', BoolDefault.Default);
    }
}
