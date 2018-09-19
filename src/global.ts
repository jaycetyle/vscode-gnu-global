import * as vscode from 'vscode';
import * as path from 'path';

const spawnSync = require('child_process').spawnSync;

/*
 * Parsed gnu global output with -x option
 * '-x', '--cxref': Use standard ctags cxref (with ‘-x’) format.
 * Sample output:
 * nfs_fh 19 /home/jayce/Projects/linux/include/linux/nfs.h struct nfs_fh {
 */
interface XFormat {
    symbol: string;
    line: number;
    path: string;
    info: string;
}

function parseXFormat(line: string): XFormat
{
    let tokens = line.split(/ +/);
    const symbol = tokens.shift();
    const lineNo = tokens.shift();
    const path = tokens.shift();
    const info = tokens.join(' ');

    if (symbol && line && path && info) {
        return {
            symbol: symbol,
            line: lineNo ? parseInt(lineNo) - 1 : 0,
            path: path ? path.replace("%20", " ") : path,
            info: info
        }
    }
    throw "Parse cxref output failed: " + line;
}

export default class Global {
    executable: string;         // Executable name. Default: global

    constructor(executable: string = 'global') {
        this.executable = executable;
    }

    public getVersion(): string {
        return this.execute(['--version'])[0];
    }

    public provideDefinition(document: vscode.TextDocument,
                             position: vscode.Position)
                             : vscode.Location[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.execute(['--encode-path', '" "', '-xa', symbol],
                                   path.dirname(document.fileName));
        return this.convertXFormatLinesToLocations(lines);
    }

    public provideReferences(document: vscode.TextDocument,
                             position: vscode.Position)
                             : vscode.Location[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.execute(['--encode-path', '" "', '-xra', symbol],
                                   path.dirname(document.fileName));
        return this.convertXFormatLinesToLocations(lines);
    }

    public provideCompletionItems(document: vscode.TextDocument,
                                  position: vscode.Position)
                                  : vscode.CompletionItem[] {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const lines = this.execute(['-c', symbol], path.dirname(document.fileName));
        return lines.map(line => new vscode.CompletionItem(line));
    }

    /* Convert gnu global --cxref output to vscode.Location */
    private convertXFormatLinesToLocations(lines: string[]): vscode.Location[] {
        let ret: vscode.Location[] = [];
        lines.forEach((line) => {
            if (!line.length)
                return; // empty line
            try {
                const parsed = parseXFormat(line);
                const colStart = parsed.info.indexOf(parsed.symbol);
                const colEnd = colStart + parsed.symbol.length;
                const start = new vscode.Position(parsed.line, colStart);
                const end = new vscode.Position(parsed.line, colEnd);
                const location = new vscode.Location(vscode.Uri.file(parsed.path),
                                                    new vscode.Range(start, end));
                ret.push(location);
            } catch (e) {
                console.log(e);
            }
        });
        return ret;
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

        let ret = spawnSync(this.executable, args, options);
        if (ret.error) {
            throw ret.error;
        }
        return ret.stdout.toString().split(/\r?\n/);
    }
}
