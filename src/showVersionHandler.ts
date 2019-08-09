import * as vscode from 'vscode';
import Global from './global/global';
import Logger from './logger';

export default class GlobalShowVersionHandler {
    global: Global;

    constructor(global: Global) {
        this.global = global;
    }

    showGlobalVersion() {
        try {
            vscode.window.showInformationMessage(this.global.getVersion());
        } catch (e) {
            Logger.error("showGlobalVersion failed: " + e);
            vscode.window.showInformationMessage('Failed to get GNU Global version');
        }
    }
}