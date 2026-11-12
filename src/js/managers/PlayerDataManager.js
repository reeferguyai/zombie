import { itemCatalog } from '../data/items.js';

export class PlayerDataManager {
    static getCharacter() {
        try {
            const raw = localStorage.getItem('phoenix-blaze-character');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    static setCharacter(character) {
        try {
            localStorage.setItem('phoenix-blaze-character', JSON.stringify(character));
            return true;
        } catch {
            return false;
        }
    }
}

export default PlayerDataManager;
