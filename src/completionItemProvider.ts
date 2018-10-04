import * as vscode from 'vscode';
import Global from './global/global';

export default class GlobalCompletionItemProvider implements vscode.CompletionItemProvider {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position,
                                  token: vscode.CancellationToken, context: vscode.CompletionContext)
                                  : vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        var self = this;
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
            try {
                resolve(self.global.provideCompletionItems(document, position));
            } catch (e) {
                return reject(e);
            }
        });
	}
}