import Global from './global';
import Configuration from './configuration';
import AutoUpdateHandler from './autoUpdateHandler';

export default class GlobalConfigurationUpdater {
    configuration: Configuration = new Configuration();
    setters: (() => void ) [] = [];

    constructor(global: Global,
                autoUpdateHandler: AutoUpdateHandler) {
        /* globalPath */
        this.setters.push(() => {
            const path = this.configuration.globalPath;
            if (path) {
                global.executable = path;
            }
        });

        /* autoUpdate */
        this.setters.push(() => {
            autoUpdateHandler.autoUpdateMode = this.configuration.autoUpdate;
        });
    }

    setAll() {
        this.setters.forEach(set => {
            try {
                set();
            } catch (e) {
                console.error(e);
            }
        });
    }
}
