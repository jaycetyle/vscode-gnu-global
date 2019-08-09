'use strict';
import * as vscode from 'vscode';
import Logger from './logger';
import Global from './global/global';
import Gtags from './global/gtags';
import Configuration from './configuration';
import AutoUpdateHandler from './autoUpdateHandler';
import ShowVersionHandler from './showVersionHandler';
import RebuildGtagsHandler from './rebuildGtagsHandler'
import DefinitionProvider from './definitionProvider'
import ReferenceProvider from './referenceProvider'
import CompletionItemProvider from './completionItemProvider'
import DocumentSymbolProvider from './documentSymbolProvider'

const configuration = new Configuration();

const global = new Global(configuration);
const gtags = new Gtags(configuration);

const autoUpdateHandler = new AutoUpdateHandler(global, configuration);
const showVersionHandler = new ShowVersionHandler(global);
const rebuildGtagsHandler = new RebuildGtagsHandler(gtags);

const disposables:vscode.Disposable[] = [];

// Called when the extension is activated
// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    Logger.init(configuration);
    Logger.info("Init logger successfully");

    disposables.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'],
                     new DefinitionProvider(global)));
    disposables.push(vscode.languages.registerReferenceProvider(['cpp', 'c'],
                     new ReferenceProvider(global)));
    disposables.push(vscode.languages.registerCompletionItemProvider(['cpp', 'c'],
                     new CompletionItemProvider(global, configuration)));
    disposables.push(vscode.languages.registerDocumentSymbolProvider(['cpp', 'c'],
                     new DocumentSymbolProvider(global)));

    disposables.push(vscode.commands.registerCommand('extension.showGlobalVersion',
                     showVersionHandler.showGlobalVersion, showVersionHandler));
    disposables.push(vscode.commands.registerCommand('extension.rebuildGtags',
                     rebuildGtagsHandler.rebuildGtags, rebuildGtagsHandler));
    disposables.push(vscode.workspace.onDidSaveTextDocument(
                     doc => autoUpdateHandler.autoUpdateTags(doc), autoUpdateHandler));

    Logger.info("Extension is now active!");
}

// This method is called when the extension is deactivated
export function deactivate() {
    disposables.forEach(d => d.dispose());
}