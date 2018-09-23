import * as vscode from 'vscode';
import * as path from 'path';

const spawnSync = require('child_process').spawnSync;

/*
 * Parsed gnu global output with -x option
 * '-x', '--cxref': Use standard ctags cxref (with ‘-x’) format.
 * Sample output:
 * nfs_fh 19 /home/jayce/Projects/linux/include/linux/nfs.h struct nfs_fh {
 */
class XRef {
    readonly symbol: string;
    readonly line: number;
    readonly path: string;
    readonly info: string;

    constructor(symbol: string,
                line: number,
                path: string,
                info: string) {
        this.symbol = symbol;
        this.line = line;
        this.path = path;
        this.info = info;
    }

    static fromGlobalOutput(line: string): XRef {
        let tokens = line.split(/ +/);
        const symbol = tokens.shift();
        const lineNo = tokens.shift();
        const path = tokens.shift();
        const info = tokens.join(' ');

        if (symbol && lineNo && path && info) {
            return new XRef (
                symbol,
                lineNo ? parseInt(lineNo) - 1 : 0,
                path ? path.replace("%20", " ") : path,
                info
            )
        }
        throw "Parse xref output failed: " + line;
    }

    /*
    * GNU Global doesn't provide symbol kind inforamtion.
    * This is a simple implementation to get the symbol kind but is not accurate.
    * Originally developed by austin in https://github.com/austin-----/code-gnu-global
    */
    get symbolKind(): vscode.SymbolKind
    {
        var kind = vscode.SymbolKind.Variable;
        if (this.info.indexOf('(') != -1) {
            kind = vscode.SymbolKind.Function;
        } else if (this.info.startsWith('class ')) {
            kind = vscode.SymbolKind.Class;
        } else if (this.info.startsWith('struct ')) {
            kind = vscode.SymbolKind.Class;
        } else if (this.info.startsWith('enum ')) {
            kind = vscode.SymbolKind.Enum;
        }
        return kind;
    }

    get range(): vscode.Range {
        const colStart = this.info.indexOf(this.symbol);
        const colEnd = colStart + this.symbol.length;
        const start = new vscode.Position(this.line, colStart);
        const end = new vscode.Position(this.line, colEnd);
        return new vscode.Range(start, end);
    }

    get location(): vscode.Location {
        return new vscode.Location(vscode.Uri.file(this.path), this.range);
    }
}

/*
 * foreach none empty string {
 *    push callbackfu return value to output array if it is not undefined
 * }
 */
function mapNoneEmpty<T>(lines: string[], callbackfn: (value: string) => T|undefined)
                         : T[] {
    let ret: T[] = [];
    lines.forEach(line => {
        if (!line.length)
            return; // empty
        const val = callbackfn(line);
        if (val)
            ret.push(val);
    });
    return ret;
}

export default class Global {
    executable: string;         // Executable name. Default: global

    constructor(executable: string = 'global') {
        this.executable = executable;
    }

    getVersion(): string {
        return this.execute(['--version'])[0];
    }

    provideDefinition(document: vscode.TextDocument,
                      position: vscode.Position)
                      : vscode.Location[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.execute(['--encode-path', '" "', '-xa', symbol],
                                   path.dirname(document.fileName));
        return mapNoneEmpty(lines, line => XRef.fromGlobalOutput(line).location);
    }

    provideReferences(document: vscode.TextDocument,
                      position: vscode.Position)
                      : vscode.Location[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.execute(['--encode-path', '" "', '-xra', symbol],
                                   path.dirname(document.fileName));
        return mapNoneEmpty(lines, line => XRef.fromGlobalOutput(line).location);
    }

    provideCompletionItems(document: vscode.TextDocument,
                           position: vscode.Position)
                           : vscode.CompletionItem[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.execute(['-c', symbol], path.dirname(document.fileName));
        return mapNoneEmpty(lines, line => new vscode.CompletionItem(line));
    }

    provideDocumentSymbols(document: vscode.TextDocument)
                           : vscode.SymbolInformation[] {
        const lines = this.execute(['--encode-path', '" "', '-xaf', document.fileName],
                                   path.dirname(document.fileName));
        return mapNoneEmpty(lines, (line) => {
            const xref = XRef.fromGlobalOutput(line);
            return new vscode.SymbolInformation(xref.symbol,
                                                xref.symbolKind,
                                                "", // container name, we don't support it
                                                xref.location);
        });
    }

    updateTags(document: vscode.TextDocument) {
        this.execute(['-u'], path.dirname(document.fileName));
    }

    /* Execute 'global args' and return stdout with line split */
    private execute(args: string[],
                    cwd: string|undefined = undefined,
                    env: any = null)
                    : string[] {
        const options = {
            cwd: cwd,
            env: env
        };

        let sync = spawnSync(this.executable, args, options);
        if (sync.error) {
            throw sync.error;
        }
        return sync.stdout.toString().split(/\r?\n/);
    }
}
