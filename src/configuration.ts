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

export enum GtagsSkipSymlinkOption {
    None = "None",
    File = "File",
    Directory = "Directory",
    All = "All"
}

export abstract class Config {
    constructor (readonly section: string) {
    }
}

export abstract class TypedConfig<T> extends Config {
    constructor (section: string, readonly defaultValue: T) {
        super(section);
    }
}

export class WindowScopeConfig<T> extends TypedConfig<T> {
    constructor (section: string, defaultValue: T) {
        super(section, defaultValue);
    }

    public get(): T {
        return vscode.workspace.getConfiguration().get<T>(this.section, this.defaultValue);
    }
}

export class WindowScopeEnumConfig<T extends { [name: string]: any }> extends WindowScopeConfig<string> {
    constructor (section: string, private enumType: T, defaultValue: string) {
        super(section, defaultValue);
    }

    public get(): T[keyof T] {
        return getEnumConfiguration(this.section, this.enumType, this.defaultValue);
    }
}

export class ResourceScopeConfig<T> extends TypedConfig<T> {
    constructor (section: string, defaultValue: T) {
        super(section, defaultValue);
    }

    public get(path: vscode.Uri): T {
        return vscode.workspace.getConfiguration(undefined, path).get<T>(this.section, this.defaultValue);
    }
}

export class ResourceScopeEnumConfig<T extends { [name: string]: any }> extends ResourceScopeConfig<string> {
    constructor (section: string, private enumType: T, defaultValue: string) {
        super(section, defaultValue);
    }

    public get(path: vscode.Uri): T[keyof T] {
        return getEnumConfiguration(this.section, this.enumType, this.defaultValue, path);
    }
}

export default class GlobalConfiguration {
    /* window scope configurations */
    readonly globalExecutable = new WindowScopeConfig('gnuGlobal.globalExecutable', 'global');

    readonly gtagsExecutable = new WindowScopeConfig('gnuGlobal.gtagsExecutable', 'gtags');

    readonly encoding = new WindowScopeConfig('gnuGlobal.encoding', 'utf-8');

    readonly objDirPrefix = new WindowScopeConfig('gnuGlobal.objDirPrefix', '');

    readonly debugMode = new WindowScopeEnumConfig('gnuGlobal.debugMode',  BoolOption, BoolDefault.Disabled);

    /* resource scope configurations */
    readonly autoUpdate = new ResourceScopeEnumConfig('gnuGlobal.autoUpdate', BoolDefault, BoolDefault.Default);

    readonly completion = new ResourceScopeEnumConfig('gnuGlobal.completion', BoolOption, BoolDefault.Enabled);

    readonly libraryPaths = new ResourceScopeConfig<string[]>('gnuGlobal.libraryPath', []);

    readonly gtagsForceCpp = new ResourceScopeEnumConfig('gnuGlobal.gtagsForceCpp', BoolOption, BoolDefault.Disabled);

    readonly gtagsSkipSymlink = new ResourceScopeEnumConfig('gnuGlobal.gtagSkipSymlink', GtagsSkipSymlinkOption, GtagsSkipSymlinkOption.None);
}

/* Util function to get and check enum config */
function getEnumConfiguration(section: string, type: any, defaultValue: string,
                              resource?: vscode.Uri | undefined) {
    if (!(defaultValue in type)) {
        throw "BUG: type of default value doesn't match given type.";
    }

    const ret = vscode.workspace.getConfiguration(undefined, resource).get(section, defaultValue);
    if (ret in type) {
        return type[ret];
    } else {
        return type[defaultValue];
    }
}
