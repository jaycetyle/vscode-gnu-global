export enum LogLevel {
    Info,
    Warning,
    Error,
    Fatal
}

export default class Logger {
    // static members for singleton pattern
    private static _instance: Logger;

    static get instance() {
        if (!this._instance) {
            this._instance = new Logger();
        }
        return this._instance;
    }

    static log(level: LogLevel, message: string) {
        this.instance.log(level, message);
    }

    // class members
    private _level: LogLevel = LogLevel.Fatal;

    get level(): LogLevel {
        return this._level;
    }

    set level(level: LogLevel) {
        this._level = level;
    }

    log(level: LogLevel, message: string) {
        if (level >= this._level) {
            if (level >= LogLevel.Error) {
                console.error(level + ": " + message);
            } else {
                console.log(level + ": " + message);
            }
        }
    }
}