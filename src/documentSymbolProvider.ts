import * as vscode from 'vscode';
import Global from './global/global';

export default class GlobalDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken)
                                  : vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        var self = this;
        return new Promise<vscode.SymbolInformation[]>((resolve, reject) => {
            try {
                resolve(self.global.provideDocumentSymbols(document));
            } catch (e) {
                return reject(e);
            }
        });
    }
}