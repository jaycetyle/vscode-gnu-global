# C/C++ GNU Global
Provide intellisense for C/C++ using [GNU Global](https://www.gnu.org/software/global/).

This extension is forked/rewriten from [C/C++ Intellisense](https://marketplace.visualstudio.com/items?itemName=austin.code-gnu-global) and is still preliminary. If you have any problems, please go to [Github Issues](https://github.com/jaycetyle/vscode-gnu-global/issues/) for issue report and feature request.

## Requirements
* This extension requires GNU Global (>=6.5). You can download the binary from [Global website](https://www.gnu.org/software/global/download.html).

    For Ubuntu 18.04 (and more) user, you can install it via apt:
    ```
    sudo apt install global
    ```

* Added it to PATH enviroment variable, or specify gnuGlobal.globalExecutable and gnuGlobal.gtagsExecutable configuration.
    ```
    {
        "gnuGlobal.globalExecutable": "C:\\global\\global.exe,
        "gnuGlobal.gtagsExecutable": "C:\\global\\gtags.exe"
    }
    ```

## Usage
GNU Global is a tagging system. There's no language service running on the background. You need to execute `Rebuild Gtags Database` to generate tag files before you can use other features.

### Command
* `Global: Rebuild Gtags Database` - Generate tag files for global by running 'gtags'.

    You need to run this command to generate tag files before using other commands. Upon saving your code, this extension will try to update tags files incrementally by running 'global -u'. If the auto update didn't do well for you, you can manully run this command to rebuild all tag files.

* `Global: Show GNU Global Version` - Show global verion by running 'global --version'.

* `Go to Definition (F12)`
* `Find All References (Shift + F12)`
* `Go to Symbol in File (Ctrl + Shift + O)`

### Configuration

* `gnuGlobal.autoUpdate`: Controls whether global should automatically update the tags after file saved. Can be Enabled, Disabled and Default. "Default": disable autoupdate if GTAGS database size is larger than 50MB. It is recommended to disable this feature if the project is too large.

* `gnuGlobal.globalExecutable`: Specify the path to the global.

* `gnuGlobal.gtagsExecutable`: Specify the path to the gtags.

## Limitations

It doesn't do any AST parsing, so the auto completion doesn't understand class members and etc.

## Resources
GNU Global: https://www.gnu.org/software/global/

Repository: https://github.com/jaycetyle/vscode-gnu-global/

**Enjoy!**