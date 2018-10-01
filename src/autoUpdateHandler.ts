import * as vscode from 'vscode';
import Global from './global';
import Configuration from './configuration'
import {BoolDefault} from './boolDefault'

export default class GlobalAutoUpdateHandler {
    global: Global;
    configuration: Configuration;

    constructor(global: Global, configuration: Configuration) {
        this.global = global;
        this.configuration = configuration;
    }

    autoUpdateTags(docChanged: vscode.TextDocument) {
        if (docChanged.languageId !== "cpp" && docChanged.languageId !== "c")
            return;

        try {
            const autoUpdateMode = this.configuration.getAutoUpdateMode(docChanged.uri);

            if (autoUpdateMode === BoolDefault.Disabled) {
                return;
            } else if (autoUpdateMode == BoolDefault.Default) {
                /* Default: disable autoupdate if GTAGS size is larger than 50MB. */
                const size = this.global.getGtagsSize(docChanged.fileName);
                if (size >= 50*1024*1024)
                    return;
            }
            this.global.updateTags(docChanged);
        } catch (e) {
            console.error(e.toString());
        }
    }
}