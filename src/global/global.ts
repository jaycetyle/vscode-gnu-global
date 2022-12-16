import executableBase from './executableBase'
import Configuration from '../configuration'
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/*
 * Parse gnu global output with -x option
 * '-x', '--cxref': Use standard ctags cxref (with ‘-x’) format.
 * Sample output:
 * nfs_fh 19 /home/jayce/Projects/linux/include/linux/nfs.h struct nfs_fh {
 */
class XRef {
    readonly symbol: string;
    readonly lineNo: number;
    readonly path: string;
    readonly info: string;

    constructor(symbol: string,
                lineNo: number,
                path: string,
                info: string) {
        this.symbol = symbol;
        this.lineNo = lineNo;
        this.path = path;
        this.info = info;
    }

    /*
     * Parse global xref(-x) output line and return XRef structure.
     *
     * A bad design in this output format is that it uses %-16s to print the pathname.
     * So if the pathname length < 16, it will append several white spaces after it and
     * confuses with the prefix white spaces of codes output.
     *
     * The following codes are cut from gnu global source code.
     * fprintf(cv->op, "%-16s %4d %-16s ", tag, lineno, convert_pathname(cv, path));
     * code_fputs(rest, cv->op);
     */
    static parseLine(line: string): XRef {
        let tokens = line.match(/([^ ]*) +([^ ]*) +([^ ]*) (.*)/);
        if (tokens === null || tokens.length != 5)
            throw 'Parse xref output failed: ' + line;

        const symbol = tokens[1];
        const lineNo = tokens[2];
        const path = tokens[3];
        const info = tokens[4].substr(path.length >= 16 ? 0 : 16 - path.length);

        return new XRef (
            symbol,
            lineNo ? parseInt(lineNo) - 1 : 0,
            path ? path.replace(/%20/g, ' ') : path,
            info
        )
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

    private static getSymbolStartIndex(line: string, symbol: string): number {
        const regex = RegExp("([a-zA-Z0-9_]*)" + symbol + "([a-zA-Z0-9_]*)", 'g');
        let result;
        while ((result = regex.exec(line)) !== null) {
            if (result[0] === symbol) {
                return result.index;
            }
        }
        // Cannot find symbol by regex(?). Fallback to indexOf.
        return line.indexOf(symbol);
    }

    get range(): vscode.Range {
        const startColumn = XRef.getSymbolStartIndex(this.info, this.symbol);
        const endColumn = startColumn + this.symbol.length;
        const startPosi = new vscode.Position(this.lineNo, startColumn);
        const endPosi = new vscode.Position(this.lineNo, endColumn);
        return new vscode.Range(startPosi, endPosi);
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

export default class Global extends executableBase {
    saved_env: any;

    constructor(configuration: Configuration) {
        super(configuration);
    }

    get executable(): string {
        return this.configuration.globalExecutable.get();
    }

    getVersion(): string {
        return this.execute(['--version'])[0];
    }

    provideDefinition(document: vscode.TextDocument,
                      position: vscode.Position)
                      : vscode.Location[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.executeOnDocument(['--encode-path', '" "', '-xaT', symbol], document);
        return mapNoneEmpty(lines, line => XRef.parseLine(line).location);
    }

    provideReferences(document: vscode.TextDocument,
                      position: vscode.Position)
                      : vscode.Location[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const reflines = this.executeOnDocument(['--encode-path', '" "', '-xra', symbol], document);
        const symlines = this.executeOnDocument(['--encode-path', '" "', '-xsa', symbol], document);
        const ret = mapNoneEmpty(reflines, line => XRef.parseLine(line).location);
        if (ret.length)
            return ret;
        return mapNoneEmpty(symlines, line => XRef.parseLine(line).location);
    }

    provideCompletionItems(document: vscode.TextDocument,
                           position: vscode.Position)
                           : vscode.CompletionItem[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.executeOnDocument(['-cT', symbol], document);
        return mapNoneEmpty(lines, line => new vscode.CompletionItem(line));
    }

    provideDocumentSymbols(document: vscode.TextDocument)
                           : vscode.SymbolInformation[] {
        const lines = this.executeOnDocument(['--encode-path', '" "', '-xaf', document.fileName], document);
        return mapNoneEmpty(lines, (line) => {
            const xref = XRef.parseLine(line);
            return new vscode.SymbolInformation(xref.symbol,
                                                xref.symbolKind,
                                                '', // container name, we don't support it
                                                xref.location);
        });
    }

    async provideWorkspaceSymbols(query: string)
                           : Promise<vscode.SymbolInformation[]> {
        const word = query + '*';
        let cmd: string[] = ['--encode-path', '" "', '-xa', word, '| head -300'];
        let lines = await this.execute_async(cmd, vscode.workspace.rootPath, this.saved_env);

        return mapNoneEmpty(lines, (line) => {
            const xref = XRef.parseLine(line);
            return new vscode.SymbolInformation(xref.symbol,
                                                xref.symbolKind,
                                                '', // container name, we don't support it
                                                xref.location);
        });
    }

    updateTags(document: vscode.TextDocument) {
        this.executeOnDocument(['-u'], document);
    }

    getGtagsSize(document: vscode.TextDocument): number {
        let gtagsPath = path.join(this.executeOnDocument(['-p'], document)[0], 'GTAGS');
        return fs.lstatSync(gtagsPath).size;
    }

    private getLibPathEnvValue(docUri: vscode.Uri): string {
        const paths = this.configuration.libraryPaths.get(docUri);
        return paths.join(path.delimiter);
    }

    private executeOnDocument(args: string[], document: vscode.TextDocument) : string[] {
        const env = {
            'MAKEOBJDIR': this.getLibPathEnvValue(document.uri),        // for previous gtags
            'MAKEOBJDIRPREFIX': this.configuration.objDirPrefix.get(),  // for previous gtags
            'GTAGSLIBPATH': this.getLibPathEnvValue(document.uri),      // alias for MAKEOBJDIR
            'GTAGSOBJDIRPREFIX': this.configuration.objDirPrefix.get(), // alias for MAKEOBJDIRPREFIX
        };

        this.saved_env = env;
        return this.execute(args, path.dirname(document.fileName), env);
    }
}
