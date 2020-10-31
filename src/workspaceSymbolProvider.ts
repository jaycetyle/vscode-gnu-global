import * as vscode from 'vscode';
import Global from './global/global';
import Logger from './logger';

export default class GlobalWorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    public async provideWorkspaceSymbols(query: string, token: vscode.CancellationToken): Promise<vscode.SymbolInformation[]> {
        let self = this;
        return new Promise<vscode.SymbolInformation[]>((resolve, reject) => {
            try {
                resolve(self.global.provideWorkspaceSymbols(query));
            } catch (e) {
                Logger.error("provideDocumentSymbols failed: " + e);
                return reject(e);
            }
        });
    }

}
