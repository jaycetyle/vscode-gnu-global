import executableBase from './executableBase'

export default class Gtags extends executableBase {
    constructor(executable: string = 'gtags') {
        super(executable);
    }

    rebuildTags(folder: string) {
        this.execute([], folder);
    }
}
