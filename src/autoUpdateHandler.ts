import * as vscode from 'vscode';
import Global from './global/global';
import Configuration from './configuration'
import {BoolDefault} from './configuration'
import Logger from './logger';

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
            const autoUpdateMode = this.configuration.autoUpdate.get(docChanged.uri);

            if (autoUpdateMode === BoolDefault.Disabled) {
                return;
            } else if (autoUpdateMode == BoolDefault.Default) {
                /* Default: disable autoupdate if GTAGS size is larger than 50MB. */
                const size = this.global.getGtagsSize(docChanged);
                if (size >= 50*1024*1024)
                    return;
            }
            this.global.updateTags(docChanged);
        } catch (e) {
            Logger.error("autoUpdateTags failed: " + e);
        }
    }
}