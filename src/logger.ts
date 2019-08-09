import Configuration, { BoolOption } from './configuration';

enum LogLevel {
    Info,
    Warning,
    Error,
    Fatal
}

export default class Logger {
    // static members for singleton pattern
    private static instance: Logger;

    static init(configuration: Configuration) {
        this.instance = new Logger(configuration);
    }

    static fatal(message: string) {
        if (this.instance) {
            this.instance.log(LogLevel.Fatal, message);
        }
    }

    static error(message: string) {
        if (this.instance) {
            this.instance.log(LogLevel.Error, message);
        }
    }

    static warn(message: string) {
        if (this.instance) {
            this.instance.log(LogLevel.Warning, message);
        }
    }

    static info(message: string) {
        if (this.instance) {
            this.instance.log(LogLevel.Info, message);
        }
    }

    // class members
    /*
     * A little bit ugly.
     * It's possible to register event to update log level, but it's not better.
     */
    private constructor(private configuration: Configuration) {
    }

    private get level(): LogLevel {
        if (this.configuration.debugMode.get() === BoolOption.Enabled) {
            return LogLevel.Info;
        } else {
            return LogLevel.Fatal;
        }
    }

    private log(level: LogLevel, message: string) {
        if (level >= this.level) {
            if (level == LogLevel.Warning) {
                console.warn("[jaycetyle.vscode-gnu-global]: " + message);
            } else if (level == LogLevel.Info) {
                console.info("[jaycetyle.vscode-gnu-global]: " + message);
            } else {
                console.error("[jaycetyle.vscode-gnu-global]: " + message);
            }
        }
    }
}