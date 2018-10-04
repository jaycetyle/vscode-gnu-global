import * as vscode from 'vscode';
import Global from './global/global';

export default class GlobalShowVersionHandler {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    showGlobalVersion() {
        try {
            vscode.window.showInformationMessage(this.global.getVersion());
        } catch (e) {
            console.error(e.toString());
            vscode.window.showInformationMessage('Failed to get GNU Global version');
        }
    }
}