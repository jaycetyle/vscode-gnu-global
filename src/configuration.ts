import * as vscode from 'vscode';

export enum BoolDefault {
    Enabled = "Enabled",
    Disabled = "Disabled",
    Default = "Default"
}

export enum BoolOption {
    Enabled = "Enabled",
    Disabled = "Disabled"
}

export default class GlobalConfiguration {
    private getConfiguration(resource?: vscode.Uri | undefined): vscode.WorkspaceConfiguration {
        const config = vscode.workspace.getConfiguration('gnuGlobal', resource);
        return config;
    }

    private getEnumConfiguration(section: string, type: any, defaultValue: string,
                                 resource?: vscode.Uri | undefined) {
        if (!(defaultValue in type)) {
            throw "BUG: type of default value doesn't match given type.";
        }

        const ret = this.getConfiguration(resource).get(section, defaultValue);
        if (ret in type) {
            return type[ret];
        } else {
            return type[defaultValue];
        }
    }

    /* window scope configurations */
    getGlobalExecutable(): string {
        return this.getConfiguration().get<string>('globalExecutable', 'global');
    }

    getGtagsExecutable(): string {
        return this.getConfiguration().get<string>('gtagsExecutable', 'gtags');
    }

    getEncoding(): string {
        return this.getConfiguration().get<string>('encoding', 'utf-8');
    }

    /* resource scope configurations */
    getAutoUpdateMode(path: vscode.Uri): BoolDefault {
        return this.getEnumConfiguration('autoUpdate', BoolDefault, BoolDefault.Default, path);
    }

    getCompletionMode(path: vscode.Uri): BoolOption {
        return this.getEnumConfiguration('completion', BoolOption, BoolOption.Enabled, path);
    }

    getGtagsForceCpp(path: vscode.Uri): BoolOption {
        return this.getEnumConfiguration('gtagsForceCpp', BoolOption, BoolOption.Disabled, path);
    }

    getLibraryPath(path: vscode.Uri): string[] {
        return this.getConfiguration(path).get<string[]>('libraryPath', []);
    }
}
