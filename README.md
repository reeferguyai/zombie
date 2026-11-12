:::writing{variant="document" id="63821"}
# 🧟🔥 PHOENIX BLAZE
### A Conscious Zombie Survival Game

<p align="center">
  <strong>RISE FROM THE DEAD. KEEP YOUR HUMANITY. SURVIVE THE APOCALYPSE.</strong>
</p>

<p align="center">
  🌋 OPEN WORLD &nbsp;•&nbsp; 🧠 CONSCIOUS UNDEAD &nbsp;•&nbsp; 🍃 SURVIVAL CRAFTING &nbsp;•&nbsp; 🎭 MORAL CHOICES
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PROJECT-PHOENIX%20BLAZE-ff4500?style=for-the-badge&logo=firefox&logoColor=white" alt="Phoenix Blaze Project"/>
  <img src="https://img.shields.io/badge/ENGINE-PHASER%203-8a2be2?style=for-the-badge" alt="Phaser 3"/>
  <img src="https://img.shields.io/badge/PLATFORM-HTML5-ff6b35?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/STATUS-IN%20DEVELOPMENT-39ff14?style=for-the-badge" alt="In Development"/>
  <img src="https://img.shields.io/badge/LICENSE-PRIVATE-bloodred?style=for-the-badge" alt="Private License"/>
</p>

---

# 📑 TABLE OF CONTENTS

| # | Section | Description |
|---|---|---|
| 01 | [🌋 Overview](#-overview) | Enter the world of Phoenix Blaze |
| 02 | [🎮 Core Features](#-core-features) | Gameplay systems and mechanics |
| 03 | [🧠 Game Identity](#-game-identity) | The world, player, and survival concept |
| 04 | [🏗️ Project Structure](#️-project-structure) | Source code and directory architecture |
| 05 | [⚙️ Technology Stack](#️-technology-stack) | Development technologies |
| 06 | [🚀 Getting Started](#-getting-started) | Installation and setup |
| 07 | [🕹️ Gameplay Systems](#️-gameplay-systems) | Core gameplay architecture |
| 08 | [🗺️ Development Roadmap](#️-development-roadmap) | Four development phases |
| 09 | [🧪 Testing & Quality](#-testing--quality) | Testing and optimization |
| 10 | [🤝 Contributing](#-contributing) | Development participation |
| 11 | [📚 Documentation](#-documentation) | Project documentation |
| 12 | [📖 Glossary](#-glossary) | Game and development terminology |
| 13 | [🔐 License](#-license) | Ownership and licensing |
| 14 | [📡 Contact](#-contact) | Project information |

---

# 🌋 OVERVIEW

**Phoenix Blaze** is an innovative HTML5-based open-world sandbox survival game where you play as a newly-turned zombie who retains human consciousness.

Manage your bloodlust with cannabis-based crafting, blend in with both humans and zombies, and navigate a post-apocalyptic world of survival, moral choices, and self-discovery.

You aren't just another zombie.

You're something different.

You're caught between two worlds: the instinct to consume and the desire to remain human.

Every decision matters. Every encounter carries consequences. Every survivor has a story.

<details>
<summary>🔥 <strong>THE PHOENIX BLAZE PREMISE</strong></summary>

A new existence begins after death.

Your character awakens as a zombie, but something unexpected has happened: your consciousness survived the transformation.

You retain memories, emotions, reasoning, and the ability to make choices.

However, your body has developed instincts that constantly threaten your remaining humanity.

The challenge isn't simply surviving the apocalypse.

It's deciding what kind of creature you will become.

</details>

## 🎯 Core Features

| Feature | Description | Category |
|---|---|---|
| 🧟 **Play as a Conscious Zombie** | Retain fragments of humanity while battling zombie instincts | Character |
| 🍃 **Cannabis Integration** | Craft marijuana-based items to suppress bloodlust and enhance abilities | Crafting |
| 🎭 **Stealth & Disguise** | Blend in with humans or mimic zombie behavior | Stealth |
| 🔨 **Deep Crafting System** | Create tools, weapons, shelters, and survival gear from gathered materials | Survival |
| 🌍 **Open-World Exploration** | Semi-open world with 6-8 diverse regions | Exploration |
| 🤖 **AI-Driven NPCs** | Dynamic interactions with human survivors and other zombies | Intelligence |
| 🎮 **Moral Decision-Making** | Branching storylines based on player choices | Story |
| 🔞 **Mature Content** | NSFW character customization and relationship mechanics | Mature |

---

# 🧠 GAME IDENTITY

<details>
<summary>🧟 <strong>THE PLAYER: HUMANITY INSIDE THE UNDEAD</strong></summary>

The player character occupies a unique position in the post-apocalyptic world.

**Human characteristics:**
- Memories and identity.
- Reasoning and decision-making.
- Emotional responses.
- Social interaction.
- Moral judgment.

**Zombie characteristics:**
- Bloodlust and hunger.
- Physical deterioration.
- Instinctive behavior.
- Hostile zombie encounters.
- Survival-driven abilities.

The tension between these characteristics creates the central gameplay experience.

</details>

<details>
<summary>🍃 <strong>CANNABIS-BASED SURVIVAL CRAFTING</strong></summary>

Cannabis integration is a distinctive gameplay mechanic.

It provides a crafting and progression system involving fictional consumables, recipes, and survival applications.

Potential mechanics include:

- Bloodlust management.
- Temporary ability enhancements.
- Craftable calming items.
- Resource gathering.
- Recipe discovery.
- Character progression.

</details>

<details>
<summary>🎭 <strong>STEALTH, DISGUISE & SOCIAL SURVIVAL</strong></summary>

The player must navigate encounters with two fundamentally different populations.

**Human survivors**
- Suspicion and trust.
- Social interactions.
- Disguise recognition.
- Reputation and consequences.

**Zombie populations**
- Behavioral mimicry.
- Threat detection.
- Hostile encounters.
- Environmental awareness.

</details>

---

# 🏗️ PROJECT STRUCTURE

The project follows a modular architecture designed to separate gameplay logic, entities, assets, interface components, and supporting utilities.

```text
zombie/
│
├── src/
│   │
│   ├── game/
│   │   ├── core/           # Core game engine
│   │   ├── systems/        # Game systems (crafting, combat, AI)
│   │   ├── entities/       # Player, enemies, NPCs
│   │   └── ui/             # HUD, menus, inventory
│   │
│   ├── assets/             # Sprites, audio, configs
│   ├── utils/              # Helper functions
│   └── index.html          # Main entry point
│
├── docs/                   # Documentation
├── tests/                  # Unit and integration tests
├── config/                 # Configuration files
├── package.json
└── README.md
```

## 📂 Directory Responsibilities

| Directory | Responsibility |
|---|---|
| `src/game/core/` | Core game engine and initialization |
| `src/game/systems/` | Crafting, combat, AI, and gameplay logic |
| `src/game/entities/` | Player, enemies, and NPC entities |
| `src/game/ui/` | HUD, menus, and inventory |
| `src/assets/` | Sprites, audio, and configurations |
| `src/utils/` | Shared helper functions |
| `docs/` | Technical and gameplay documentation |
| `tests/` | Automated testing |
| `config/` | Project configuration |

---

# ⚙️ TECHNOLOGY STACK

The technology foundation uses established web-development tools and a browser-based 2D game engine.

| Component | Technology | Purpose |
|---|---|---|
| 🎮 Framework | Phaser 3 | 2D game engine for web |
| 💻 Language | JavaScript (ES6+) | Game logic and application code |
| 📦 Build Tool | Webpack / Parcel | Bundling and development builds |
| 🧪 Testing | Jest | Automated testing |
| 🌿 Version Control | Git | Source control and collaboration |
| 🌐 Platform | HTML5 | Browser-based delivery |

### 🧩 Technology Highlights

- **Phaser 3:** Scene management, rendering, physics, input, and game objects.
- **JavaScript ES6+:** Modern modular application development.
- **Webpack/Parcel:** Asset processing and production bundling.
- **Jest:** Automated unit and integration testing.
- **Git:** Version history and collaborative development.

---

# 🚀 GETTING STARTED

Ready to rise from the grave?

Follow the instructions below to get the project running locally.

## 📋 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v14+ |
| npm | Compatible with installed Node.js |
| Yarn | Optional alternative package manager |
| Git | Recommended |

## 📥 Installation

### Step 1: Clone the repository

```bash
git clone https://github.com/reeferguyai/zombie.git
```

### Step 2: Enter the project directory

```bash
cd zombie
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Start the development server

```bash
npm run dev
```

### Step 5: Build for production

```bash
npm run build
```

## 🖥️ Development Commands

| Command | Action |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |

> 💡 **Development Note:** The actual available scripts are determined by `package.json`. The commands above preserve the original project's documented setup.

---

# 🕹️ GAMEPLAY SYSTEMS

This section organizes the major gameplay concepts into functional development categories.

The following is an expanded architectural guide, not a claim that all systems have already been implemented.

## 🧟 1. Character & Identity System

Potential responsibilities:

- Character creation.
- Character appearance.
- Human consciousness.
- Zombie transformation.
- Character progression.
- Relationship attributes.

## 🩸 2. Bloodlust Management

Potential responsibilities:

- Bloodlust meter.
- Instinctive behavior.
- Hunger progression.
- Player control consequences.
- Suppression mechanics.
- Survival decisions.

## 🍃 3. Crafting & Resource System

Potential responsibilities:

- Resource collection.
- Item recipes.
- Crafting stations.
- Cannabis-based fictional crafting.
- Survival equipment.
- Inventory management.

## 🎭 4. Stealth & Disguise System

Potential responsibilities:

- Human disguise.
- Zombie behavioral mimicry.
- Suspicion detection.
- NPC recognition.
- Stealth encounters.

## 🤖 5. AI & NPC System

Potential responsibilities:

- Human survivor behavior.
- Zombie behavior.
- NPC interaction.
- Dynamic reactions.
- Relationship progression.
- Dialogue and decision systems.

## 🌍 6. World & Exploration System

Potential responsibilities:

- Semi-open world.
- 6-8 diverse regions.
- Environmental exploration.
- Resource locations.
- Safe zones.
- Hostile territories.

## ⚔️ 7. Combat & Survival System

Potential responsibilities:

- Combat interactions.
- Weapons and tools.
- Enemy behavior.
- Damage and health.
- Survival equipment.
- Environmental threats.

## 🎮 8. Story & Moral Decision System

Potential responsibilities:

- Branching storylines.
- Player choices.
- Reputation.
- Relationship outcomes.
- Narrative progression.
- Multiple possible endings.

---

# 🗺️ DEVELOPMENT ROADMAP

<details open>
<summary>🔥 <strong>PHASE 1: FOUNDATION (WEEKS 1-4)</strong></summary>

**Objective:** Establish the project foundation and basic player systems.

- [x] Project setup and architecture
- [ ] Character creation system
- [ ] Basic movement and controls
- [ ] Simple crafting (multi-stick)
- [ ] Inventory system

<progress value="1" max="5"></progress>

</details>

<details>
<summary>⚔️ <strong>PHASE 2: CORE MECHANICS (WEEKS 5-8)</strong></summary>

**Objective:** Implement the major survival and gameplay mechanics.

- [ ] Combat system
- [ ] Bloodlust meter
- [ ] Cannabis mechanics
- [ ] Basic AI (zombie behavior)
- [ ] World generation

<progress value="0" max="5"></progress>

</details>

<details>
<summary>🌎 <strong>PHASE 3: CONTENT (WEEKS 9-12)</strong></summary>

**Objective:** Expand the world, characters, and narrative.

- [ ] Expanded crafting recipes
- [ ] NPC interactions
- [ ] Stealth/disguise mechanics
- [ ] Story progression
- [ ] Environment design

<progress value="0" max="5"></progress>

</details>

<details>
<summary>✨ <strong>PHASE 4: POLISH (WEEKS 13-16)</strong></summary>

**Objective:** Refine the experience and prepare for beta release.

- [ ] UI/UX refinement
- [ ] Audio integration
- [ ] Performance optimization
- [ ] Testing and debugging
- [ ] Beta release

<progress value="0" max="5"></progress>

</details>

### 📊 Roadmap Summary

| Phase | Timeline | Focus | Status |
|---|---|---|---|
| Phase 1 | Weeks 1-4 | Foundation | 🟡 In Progress |
| Phase 2 | Weeks 5-8 | Core Mechanics | ⚪ Planned |
| Phase 3 | Weeks 9-12 | Content | ⚪ Planned |
| Phase 4 | Weeks 13-16 | Polish | ⚪ Planned |

**Note:** Roadmap status is illustrative. The original checked and unchecked task states are preserved.

---

# 🧪 TESTING & QUALITY

Testing is essential for maintaining stability as the game grows.

The original project identifies Jest as its testing framework.

### Testing Categories

| Test Category | Purpose |
|---|---|
| Unit Testing | Verify individual functions and components |
| Integration Testing | Verify interactions between gameplay systems |
| Gameplay Testing | Validate player-facing mechanics |
| UI Testing | Verify menus, HUD, and inventory behavior |
| Performance Testing | Identify rendering and processing bottlenecks |
| Regression Testing | Ensure updates don't break existing functionality |

### Quality Goals

- Consistent gameplay behavior.
- Stable game initialization.
- Reliable inventory operations.
- Predictable NPC interactions.
- Smooth browser performance.
- Functional production builds.

---

# 📚 DOCUMENTATION

The `docs/` directory is the home for supporting project documentation.

| Document | Purpose |
|---|---|
| `README.md` | Project overview and setup |
| `docs/CONTRIBUTING.md` | Contribution guidelines |
| Game Design Document | Gameplay vision and mechanics |
| Technical Architecture | System architecture |
| Crafting Documentation | Crafting and recipe systems |
| NPC Documentation | AI and interaction systems |
| World Documentation | Regions and environmental design |

*Additional documents are recommended organizational additions, not assertions that these files currently exist.*

---

# 🤝 CONTRIBUTING

Interested in contributing to Phoenix Blaze?

We welcome development participation in areas such as:

- 🎮 Gameplay mechanics.
- 🎨 Art and visual assets.
- 🤖 NPC and AI systems.
- 🔨 Crafting mechanics.
- 🌍 World design.
- 🧪 Testing and debugging.
- 📖 Documentation.

See **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** for guidelines.

### Contribution Principles

1. Keep gameplay systems modular.
2. Maintain readable and organized code.
3. Test changes before submitting.
4. Document new functionality.
5. Preserve the project's core creative vision.

---

# 📖 GLOSSARY

A quick reference to terminology used throughout Phoenix Blaze.

| Term | Definition |
|---|---|
| 🧟 Conscious Zombie | A zombie character who retains human awareness |
| 🩸 Bloodlust | The instinctive hunger that challenges player control |
| 🍃 Cannabis Integration | Fictional cannabis-based crafting and gameplay mechanics |
| 🎭 Disguise | Techniques used to conceal the player's zombie identity |
| 🤖 NPC | Non-player character controlled by game logic or AI |
| 🌍 Open World | An explorable game environment |
| 🔨 Crafting | Combining gathered resources to create items |
| 🧠 Human Consciousness | The player's retained memories, reasoning, and identity |
| 🎮 Branching Storyline | Narrative progression influenced by player choices |
| 🏕️ Safe Zone | A potential location offering protection from hostile threats |
| 🧪 Phaser 3 | JavaScript framework used for 2D game development |
| 🏗️ Game Engine | The underlying system responsible for running the game |

---

# 🎨 VISUAL IDENTITY & README STYLE GUIDE

The following palette provides a visual direction for future documentation, branding, and game interface development.

| Color | Hex | Intended Use |
|---|---|---|
| 🔥 Inferno Orange | `#FF4500` | Primary highlights |
| 🩸 Blood Red | `#B22222` | Danger and combat |
| 🌿 Toxic Green | `#39FF14` | Survival and status |
| 🌌 Midnight Black | `#080808` | Backgrounds |
| 🟣 Apocalypse Purple | `#8A2BE2` | Mystery and supernatural elements |
| ⚙️ Ash Gray | `#A9A9A9` | Secondary information |
| ☀️ Phoenix Gold | `#FFD700` | Achievements and rewards |

### Recommended Interface Effects

- Animated fire and ember effects.
- Glowing neon headings.
- Blood-red danger indicators.
- Toxic-green status lights.
- Animated loading indicators.
- Hover-responsive buttons.
- Collapsible documentation sections.
- Interactive tables of contents.
- Progress bars and milestone indicators.

> 🔥 **Visual Direction:** A world caught between the last embers of civilization and the first sparks of something new.

---

# 🔐 LICENSE

**Private - All rights reserved**

Phoenix Blaze is a private project.

All rights reserved unless otherwise authorized by the project owner.

---

# 📡 CONTACT

| Contact | Information |
|---|---|
| **Developer** | `@reeferguyai` |
| **GitHub Repository** | [reeferguyai/zombie](https://github.com/reeferguyai/zombie) |
| **Contribution Guidelines** | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) |

---

<p align="center">
  🔥 🧟 🍃 🎮 🌋
</p>

<h2 align="center">RISE. SURVIVE. REMEMBER WHO YOU WERE.</h2>

<p align="center">
  <strong>PHOENIX BLAZE</strong><br/>
  <em>Death was supposed to be the end. You have other plans.</em>
</p>

<p align="center">
  🌿 <strong>END OF README</strong> 🌿
</p>
