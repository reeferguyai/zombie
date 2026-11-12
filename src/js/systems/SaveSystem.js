const SAVE_KEY = 'phoenix-blaze-save-v1';
const SAVE_VERSION = 1;

export class SaveSystem {
    saveState(state) {
        try {
            const envelope = {
                version: SAVE_VERSION,
                savedAt: new Date().toISOString(),
                state: JSON.parse(JSON.stringify(state))
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
            return { success: true, savedAt: envelope.savedAt };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    loadState() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return { success: false, reason: 'missing' };
            const save = JSON.parse(raw);
            if (save.version !== SAVE_VERSION || !save.state || typeof save.state !== 'object') {
                return { success: false, reason: 'invalid' };
            }
            return { success: true, state: save.state, savedAt: save.savedAt };
        } catch (error) {
            return { success: false, reason: 'corrupt', error: error.message };
        }
    }

    hasSave() {
        return this.loadState().success;
    }

    deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }
}
