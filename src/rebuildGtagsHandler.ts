import * as vscode from 'vscode';
import Gtags from './gtags';

export default class GlobalRebuildGtags {
    gtags: Gtags;

    constructor(gtags: Gtags) {
        this.gtags = gtags;
    }

    rebuildGtags() {
        let folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            return;
        }

        let errors: vscode.WorkspaceFolder[] = [];
        for (let folder of folders) {
            try {
                this.gtags.rebuildTags(folder.uri.fsPath);
            } catch (e) {
                errors.push(folder);
            }
        }
    }
}