import * as vscode from 'vscode';
import Global from './global/global';
import Logger from './logger';

export default class GlobalReferenceProvider implements vscode.ReferenceProvider {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    provideReferences(document: vscode.TextDocument, position: vscode.Position,
                             context: vscode.ReferenceContext, token: vscode.CancellationToken)
                             : vscode.ProviderResult<vscode.Location[]> {
        var self = this;
        return new Promise<vscode.Location[]>((resolve, reject) => {
            try {
                resolve(self.global.provideReferences(document, position));
            } catch (e) {
                Logger.error("provideReferences failed: " + e);
                return reject(e);
            }
        });
    }
}