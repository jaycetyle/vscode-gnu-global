# C/C++ GNU Global
Provide Intellisense for C/C++ using [GNU Global](https://www.gnu.org/software/global/).

This extension is forked/rewriten from [C/C++ Intellisense](https://marketplace.visualstudio.com/items?itemName=austin.code-gnu-global) and is still preliminary. If you have any problems, please go to [Github Issues](https://github.com/jaycetyle/vscode-gnu-global/issues/) for issue report and feature request.

## Usage
* This extension requires GNU Global (>=6.5). You can download the binary from [Global website](https://www.gnu.org/software/global/download.html).

    For Ubuntu 18.04 (and after) user, you can install it via apt:
    ```
    sudo apt install global
    ```

* Add the folder of global executable to PATH enviroment variable, or specify gnuGlobal.globalExecutable and gnuGlobal.gtagsExecutable configuration.
    ```
    {
        "gnuGlobal.globalExecutable": "C:\\global\\global.exe",
        "gnuGlobal.gtagsExecutable": "C:\\global\\gtags.exe"
    }
    ```

* GNU Global is a tagging system. There's no language service running in the background. You need to press F1 and execute  `Global: Rebuild Gtags Database`  to generate tag files before you can use other features.

### Command
* `Global: Rebuild Gtags Database`
    * Generate tag files for global by running 'gtags'.
    * You need to run this command to generate tag files before using other commands. Upon saving your code, this extension will try to update tags files incrementally by running 'global -u'. If the auto update didn't do well for you, you can manully run this command to rebuild all tag files.
    * You may want to add the tag files, which are GTAGS, GRTAGS, and GPATH, to your global gitignore setting.

* `Global: Show GNU Global Version`
    * Show global verion by running 'global --version'.

* `Go to Definition (F12)`
* `Find All References (Shift + F12)`
* `Go to Symbol in File (Ctrl + Shift + O)`

### Configuration
* `gnuGlobal.autoUpdate`
    * Controls whether global should automatically update the tags after file saved. Can be **Enabled**, **Disabled** and **Default**.
    * Default: disable autoupdate if GTAGS database size is larger than 50MB. It is recommended to disable this feature if the project is too large.

* `gnuGlobal.completion`
    * Enable/disable auto-completion feature. Default is enabled.

* `gnuGlobal.gtagsForceCpp`
    * If this option is enabled, each file whose suffix is \".h\" is treated as a C++ source file. You need to rebuild gtags if you change this configuration. Default is disabled.

* `gnuGlobal.libraryPath` (Experimental)
    * Used as the path to search for library functions. If the specified tags is not found in the project, this extension also searches in these paths.
    * Please note that 'Rebuild Gtags Database' doesn't rebuild the tag files for these libraries. You need to build tags for them individually.
    * Folder / Workspace setting will override user setting just like other configurations.

* `gnuGlobal.globalExecutable`
    * Specify the path to the global. Default is 'global'.

* `gnuGlobal.gtagsExecutable`
    * Specify the path to the gtags. Default is 'gtags'.

## Limitations

GNU global doesn't do any AST parsing, so the auto completion doesn't understand class members and etc.

## Resources
GNU Global: https://www.gnu.org/software/global/

Repository: https://github.com/jaycetyle/vscode-gnu-global/

**Enjoy!**