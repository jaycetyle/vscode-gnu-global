'use strict';
import * as vscode from 'vscode';
import Global from './global';
import Configuration, { BoolDefault } from './configuration';
import DefinitionProvider from './definitionProvider'
import ReferenceProvider from './referenceProvider'
import CompletionItemProvider from './completionItemProvider'
import DocumentSymbolProvider from './documentSymbolProvider'

const disposables:vscode.Disposable[] = [];
const global = new Global();
const configuration = new Configuration();

// Called when the extension is activated
// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('"vscode-gnu-global" is now active!');

    disposables.push(vscode.commands.registerCommand('extension.showGlobalVersion',
                     onShowGlobalVersion));
    disposables.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'],
                     new DefinitionProvider(global)));
    disposables.push(vscode.languages.registerReferenceProvider(['cpp', 'c'],
                     new ReferenceProvider(global)));
    disposables.push(vscode.languages.registerCompletionItemProvider(['cpp', 'c'],
                     new CompletionItemProvider(global)));
    disposables.push(vscode.languages.registerDocumentSymbolProvider(['cpp', 'c'],
                     new DocumentSymbolProvider(global)));
    disposables.push(vscode.workspace.onDidSaveTextDocument(doc => onDidSaveTextDocument(doc)));
}

function onShowGlobalVersion() {
    try {
        vscode.window.showInformationMessage(global.getVersion());
    } catch (e) {
        console.error(e.toString());
        vscode.window.showInformationMessage('Failed to get GNU Global version');
    }
}

function checkConfigAndUpdateTags(doc: vscode.TextDocument) {
    const autoUpdate = configuration.autoUpdate;
    if (autoUpdate === BoolDefault.Disabled) {
        return;
    } else if (autoUpdate == BoolDefault.Default) {
        /* Default: disable autoupdate if GTAGS size is larger than 50MB. */
        const size = global.getGtagsSize(doc.fileName);
        if (size >= 50*1024*1024)
            return;
    }
    global.updateTags(doc);
}

function onDidSaveTextDocument(doc: vscode.TextDocument) {
    try {
        if (doc.languageId !== "cpp" && doc.languageId !== "c")
            return;

        checkConfigAndUpdateTags(doc);
    } catch (e) {
        console.error(e.toString());
    }
}

// This method is called when the extension is deactivated
export function deactivate() {
    disposables.forEach(d => d.dispose());
}
