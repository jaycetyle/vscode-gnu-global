'use strict';
import * as vscode from 'vscode';
import Global from './global';
import Gtags from './gtags';
import ConfigurationUpdater from './configurationUpdater';
import AutoUpdateHandler from './autoUpdateHandler';
import ShowVersionHandler from './showVersionHandler';
import RebuildGtagsHandler from './rebuildGtagsHandler'
import DefinitionProvider from './definitionProvider'
import ReferenceProvider from './referenceProvider'
import CompletionItemProvider from './completionItemProvider'
import DocumentSymbolProvider from './documentSymbolProvider'

const global = new Global();
const gtags = new Gtags();

const autoUpdateHandler = new AutoUpdateHandler(global);
const showVersionHandler = new ShowVersionHandler(global);
const rebuildGtagsHandler = new RebuildGtagsHandler(gtags);
const configurationUpdater = new ConfigurationUpdater(global, autoUpdateHandler);

const disposables:vscode.Disposable[] = [];

// Called when the extension is activated
// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('"vscode-gnu-global" is now active!');

    configurationUpdater.setAll();
    disposables.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'],
                     new DefinitionProvider(global)));
    disposables.push(vscode.languages.registerReferenceProvider(['cpp', 'c'],
                     new ReferenceProvider(global)));
    disposables.push(vscode.languages.registerCompletionItemProvider(['cpp', 'c'],
                     new CompletionItemProvider(global)));
    disposables.push(vscode.languages.registerDocumentSymbolProvider(['cpp', 'c'],
                     new DocumentSymbolProvider(global)));

    disposables.push(vscode.commands.registerCommand('extension.showGlobalVersion',
                     showVersionHandler.showGlobalVersion, showVersionHandler));
    disposables.push(vscode.commands.registerCommand('extension.rebuildGtags',
                     rebuildGtagsHandler.rebuildGtags, rebuildGtagsHandler));
    disposables.push(vscode.workspace.onDidSaveTextDocument(
                     doc => autoUpdateHandler.autoUpdateTags(doc)));
    disposables.push(vscode.workspace.onDidChangeConfiguration(
                     () => configurationUpdater.setAll()));
}

// This method is called when the extension is deactivated
export function deactivate() {
    disposables.forEach(d => d.dispose());
}
