import * as vscode from 'vscode';
import * as path from 'path';

const spawnSync = require('child_process').spawnSync;

/*
 * Parsed gnu global output
 * Sample output:
 * nfs_fh 19 /home/jayce/Projects/linux/include/linux/nfs.h struct nfs_fh {
 */
interface GlobalOutput {
    symbol: string;
    line: number;
    path: string;
    info: string;
}

export default class Global {
    executable: string;         // Executable name. Default: global

    constructor(executable: string = 'global') {
        this.executable = executable;
    }

    public getVersion(): string {
        return this.execute(['--version']).split(/\r?\n/)[0];
    }

    public provideDefinition(document: vscode.TextDocument,
                             position: vscode.Position)
                             : vscode.Location[] {
        let ret: vscode.Location[] = [];
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const output = this.execute(['--encode-path', '" "', '-xa', symbol],
                                    path.dirname(document.fileName));
        const lines = output.split(/\r?\n/);
        lines.forEach((line) => {
            let parsed = this.parseLine(line);
            if (parsed) {
                const colStart = parsed.info.indexOf(parsed.symbol);
                const colEnd = colStart + parsed.symbol.length;
                const start = new vscode.Position(parsed.line, colStart);
                const end = new vscode.Position(parsed.line, colEnd);
                const location = new vscode.Location(vscode.Uri.file(parsed.path),
                                                     new vscode.Range(start, end));
                ret.push(location);
            }
        });
        return ret;
    }

    public provideCompletionItems(document: vscode.TextDocument,
                                  position: vscode.Position)
                                  : vscode.CompletionItem[] {
        let ret: vscode.CompletionItem[] = [];
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const output = this.execute(['-c', symbol], path.dirname(document.fileName));
        const lines = output.split(/\r?\n/);
        lines.forEach((line) => {
            ret.push(new vscode.CompletionItem(line));
        });
        return ret;
    }

    private parseLine(output: string): GlobalOutput|undefined
    {
        let tokens = output.split(/ +/);
        const symbol = tokens.shift();
        const line = tokens.shift();
        const path = tokens.shift();
        const info = tokens.join(' ');

        if (symbol && line && path && info) {
            return {
                symbol: symbol,
                line: line ? parseInt(line) - 1 : 0,
                path: path ? path.replace("%20", " ") : path,
                info: info
            }
        }
        return undefined;
    }

    /* Execute 'global args' and return stdout */
    private execute(args: string[],
                    cwd: string|undefined = undefined,
                    env: any = null)
                    : string {
        const options = {
            cwd: cwd,
            env: env
        };

        let ret = spawnSync(this.executable, args, options);
        if (ret.error) {
            throw ret.error;
        }
        console.log(ret.stdout.toString());
        return ret.stdout.toString();
    }
}
