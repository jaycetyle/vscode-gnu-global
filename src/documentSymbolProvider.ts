import * as vscode from 'vscode';
import Global from './global';

export default class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken)
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