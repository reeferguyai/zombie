const SAVE_VERSION = 2;
const SLOT_PREFIX = 'phoenix-blaze-save-slot-';
const SLOT_COUNT = 3;

export class SaveSystem {
    saveSlot(slot, state) {
        if (!Number.isInteger(slot) || slot < 1 || slot > SLOT_COUNT) return { success: false, error: 'Invalid save slot.' };
        try {
            const envelope = { version: SAVE_VERSION, savedAt: new Date().toISOString(), state: JSON.parse(JSON.stringify(state)) };
            localStorage.setItem(`${SLOT_PREFIX}${slot}`, JSON.stringify(envelope));
            return { success: true, savedAt: envelope.savedAt };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    loadSlot(slot) {
        try {
            const raw = localStorage.getItem(`${SLOT_PREFIX}${slot}`);
            if (!raw) return { success: false, reason: 'missing' };
            const save = JSON.parse(raw);
            if (![1, SAVE_VERSION].includes(save.version) || !save.state || typeof save.state !== 'object') return { success: false, reason: 'invalid' };
            return { success: true, state: save.state, savedAt: save.savedAt, slot };
        } catch (error) {
            return { success: false, reason: 'corrupt', error: error.message };
        }
    }

    listSlots() {
        return Array.from({ length: SLOT_COUNT }, (_, index) => {
            const slot = index + 1;
            const result = this.loadSlot(slot);
            return { slot, exists: result.success, savedAt: result.savedAt || null, characterName: result.state?.character?.name || null };
        });
    }

    saveState(state) { return this.saveSlot(1, state); }
    loadState() { return this.loadSlot(1); }
    hasSave() { return this.listSlots().some((slot) => slot.exists); }
    deleteSave(slot = 1) { localStorage.removeItem(`${SLOT_PREFIX}${slot}`); }
}
