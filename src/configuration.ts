import * as vscode from 'vscode';
import {BoolDefault} from './boolDefault';
import Global from './global';

export default class GlobalConfiguration {
    windowScopeSetters: (() => void ) [] = [];

    constructor(global: Global) {
        /* globalExecutable path */
        this.windowScopeSetters.push(() => {
            const path = this.getConfiguration().get<string>('globalExecutable');
            if (path) {
                global.executable = path;
            }
        });
    }

    applyWindowsScopeConfigs() {
        for (let set of this.windowScopeSetters) {
            try {
                set();
            } catch (e) {
                console.error(e);
            }
        }
    }

    /* resource scope configurations */
    getAutoUpdateMode(path: vscode.Uri): BoolDefault {
        return this.getConfiguration(path).get<BoolDefault>('autoUpdate', BoolDefault.Default);
    }

    private getConfiguration(resource?: vscode.Uri | undefined): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('gnuGlobal', resource);
    }
}
