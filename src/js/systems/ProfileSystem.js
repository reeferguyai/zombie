const PROFILE_KEY = 'phoenix-blaze-profile-v1';

export class ProfileSystem {
    constructor(profile = {}) {
        this.data = {
            totalExperience: Number(profile.totalExperience) || 0,
            lifetimeQuests: Number(profile.lifetimeQuests) || 0,
            discoveredRegions: Array.isArray(profile.discoveredRegions) ? profile.discoveredRegions : [],
            storyFlags: profile.storyFlags && typeof profile.storyFlags === 'object' ? profile.storyFlags : {}
        };
    }

    awardExperience(amount) { this.data.totalExperience += Math.max(0, Number(amount) || 0); }
    recordQuest() { this.data.lifetimeQuests += 1; }
    discover(regionId) { if (!this.data.discoveredRegions.includes(regionId)) this.data.discoveredRegions.push(regionId); }
    setStoryFlag(flag, value = true) { this.data.storyFlags[flag] = value; }
    serialize() { return JSON.parse(JSON.stringify(this.data)); }

    save() {
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(this.data)); return true; }
        catch { return false; }
    }

    static load() {
        try { return new ProfileSystem(JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')); }
        catch { return new ProfileSystem(); }
    }
}
