'use strict';
import * as vscode from 'vscode';
import Global from './global';
import DefinitionProvider from './definitionProvider'
import CompletionItemProvider from './completionItemProvider'

const disposables:vscode.Disposable[] = [];
const global = new Global();

// Called when the extension is activated
// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('"vscode-gnu-global" is now active!');
    // var configuration = vscode.workspace.getConfiguration('gnuGlobal');

    disposables.push(vscode.commands.registerCommand('extension.showGlobalVersion',
                     onShowGlobalVersion));
    disposables.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'],
                     new DefinitionProvider(global)));
    disposables.push(vscode.languages.registerCompletionItemProvider(['cpp', 'c'],
                     new CompletionItemProvider(global)));
}

function onShowGlobalVersion() {
    try {
        vscode.window.showInformationMessage(global.getVersion());
    } catch (e) {
        console.error(e.toString());
        vscode.window.showInformationMessage('Failed to run get GNU Global version');
    }
}

// This method is called when the extension is deactivated
export function deactivate() {
    disposables.forEach(d => d.dispose());
}
