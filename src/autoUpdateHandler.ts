import * as vscode from 'vscode';
import Global from './global';
import {BoolDefault} from './boolDefault'

export default class GlobalAutoUpdateHandler {
    global: Global;
    autoUpdateMode: BoolDefault = BoolDefault.Default;

    constructor(global: Global) {
        this.global = global;
    }

    autoUpdateTags(docChanged: vscode.TextDocument) {
        if (docChanged.languageId !== "cpp" && docChanged.languageId !== "c")
            return;

        try {
            if (this.autoUpdateMode === BoolDefault.Disabled) {
                return;
            } else if (this.autoUpdateMode == BoolDefault.Default) {
                /* Default: disable autoupdate if GTAGS size is larger than 50MB. */
                const size = this.global.getGtagsSize(docChanged.fileName);
                if (size >= 50*1024*1024)
                    return;
            }
            this.global.updateTags(docChanged);
        } catch (e) {
            console.error(e.toString());
            vscode.window.showInformationMessage('Failed to get GNU Global version');
        }
    }
}