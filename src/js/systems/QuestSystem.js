export class QuestSystem {
    constructor(savedQuests = {}) {
        this.quests = [
            {
                id: 'first-supplies', title: 'First Supplies', faction: 'resistance',
                description: 'Gather 3 pieces of salvage for the Resistance scout.', target: 'scrap', required: 3,
                rewardXp: 30, rewardItem: 'bandage'
            },
            {
                id: 'calm-the-hunger', title: 'Keep the Hunger Quiet', faction: 'cultists',
                description: 'Find a wild herb and learn to control your instincts.', target: 'herb', required: 1,
                rewardXp: 20, rewardItem: 'water'
            }
        ].map((quest) => ({ ...quest, progress: savedQuests[quest.id]?.progress || 0, completed: Boolean(savedQuests[quest.id]?.completed) }));
    }

    recordGather(itemId, quantity = 1) {
        this.quests.forEach((quest) => {
            if (!quest.completed && quest.target === itemId) {
                quest.progress = Math.min(quest.required, quest.progress + quantity);
            }
        });
    }

    getAvailable() {
        return this.quests.filter((quest) => !quest.completed);
    }

    complete(questId) {
        const quest = this.quests.find((entry) => entry.id === questId);
        if (!quest || quest.completed || quest.progress < quest.required) return null;
        quest.completed = true;
        return { xp: quest.rewardXp, itemId: quest.rewardItem };
    }

    serialize() {
        return Object.fromEntries(this.quests.map(({ id, progress, completed }) => [id, { progress, completed }]));
    }
}
