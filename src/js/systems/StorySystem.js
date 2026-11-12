const CHAPTERS = [
    { id: 'awakening', title: 'The First Morning', text: 'You wake beneath a sky the color of ash. Your pulse is gone, but your memories remain. The hunger is new; the name you remember is yours.' },
    { id: 'divide', title: 'Between Two Worlds', text: 'People see a threat. The dead see something unfamiliar. Your choices—not your condition—will decide where you belong.' },
    { id: 'embers', title: 'What We Keep', text: 'Every small act of restraint is a choice to remain yourself. Every alliance asks what that promise is worth.' }
];

export class StorySystem {
    constructor(saved = {}) {
        this.chapterIndex = Math.max(0, Math.min(CHAPTERS.length - 1, Number(saved.chapterIndex) || 0));
        this.flags = { ...(saved.flags || {}) };
        this.journal = Array.isArray(saved.journal) ? [...saved.journal] : [];
    }

    getCurrentChapter() { return CHAPTERS[this.chapterIndex]; }
    getPerspective(character = {}) {
        const name = character.name || 'The survivor';
        const history = character.backstory?.trim() || 'A life left behind in the first days of the outbreak.';
        return `${name} remembers being human, though the world now sees only the undead. Before the outbreak: ${history} The story is told from inside that contradiction: survival is physical, but humanity is a series of choices.`;
    }
    addEntry(title, text) {
        if (!this.journal.some((entry) => entry.title === title && entry.text === text)) this.journal.unshift({ title, text, date: new Date().toISOString() });
    }
    recordChoice(id, value) { this.flags[id] = value; this.addEntry('A choice made', `${id}: ${value}`); }
    advanceChapter() { this.chapterIndex = Math.min(CHAPTERS.length - 1, this.chapterIndex + 1); return this.getCurrentChapter(); }
    getChapters() { return CHAPTERS.map((chapter, index) => ({ ...chapter, current: index === this.chapterIndex, completed: index < this.chapterIndex })); }
    serialize() { return { chapterIndex: this.chapterIndex, flags: { ...this.flags }, journal: [...this.journal] }; }
}
