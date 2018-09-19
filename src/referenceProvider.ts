import * as vscode from 'vscode';
import Global from './global';

export default class ReferenceProvider implements vscode.ReferenceProvider {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    public provideReferences(document: vscode.TextDocument, position: vscode.Position,
                             context: vscode.ReferenceContext, token: vscode.CancellationToken)
                             : vscode.ProviderResult<vscode.Location[]> {
        var self = this;
        return new Promise<vscode.Location[]>((resolve, reject) => {
            try {
                resolve(self.global.provideReferences(document, position));
            } catch (e) {
                return reject(e);
            }
        });
    }
}