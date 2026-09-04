/**
 * Character Creation Scene
 * Handles all character customization including:
 * - Physical appearance (body, face, clothing)
 * - NSFW customization options
 * - Backstory creation
 * - Ability/perk selection
 * 
 * @class CharacterCreationScene
 * @extends Phaser.Scene
 */
class CharacterCreationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterCreationScene' });
    
    this.currentStep = 0;
    this.characterData = {
      name: '',
      appearance: {
        bodyType: 'slim', // slim, athletic, curvy, muscular
        skinTone: '#8B4513', // Brown
        height: 'petite', // petite, average, tall
        hairColor: '#000000', // Black
        hairStyle: 'long', // short, medium, long, wavy, curly
        eyeColor: '#6B4423', // Brown
        nsfw: {
          breastSize: 'medium', // small, medium, large
          bodyHair: false,
          pubicStyle: 'trimmed', // none, trimmed, natural, shaved
          tattoos: [],
        }
      },
      clothing: {
        topless: false,
        pantsless: false,
        customOutfit: null,
      },
      backstory: '',
      personality: 'neutral', // neutral, aggressive, compassionate, cunning
      skills: [], // Array of selected skills
      bloodType: 'O+', // Blood type for gameplay
    };
    
    this.steps = [
      'name',
      'bodyType',
      'skinTone',
      'hairCustomization',
      'faceCustomization',
      'nsfw',
      'clothing',
      'backstory',
      'personality',
      'skills',
      'review'
    ];
    
    this.previewGraphics = null;
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Main container
    this.mainContainer = this.add.container(0, 0);
    
    // Background
    this.add.rectangle(512, 384, 1024, 768, 0x2d2d2d, 0.8);
    
    // Title
    this.titleText = this.add.text(512, 40, 'Character Creation', {
      font: 'bold 48px Arial',
      fill: '#ff6b6b',
      align: 'center'
    }).setOrigin(0.5);
    
    // Progress indicator
    this.progressBar = this.add.graphics();
    this.updateProgressBar();
    
    // Character preview area
    this.createPreviewPanel();
    
    // Content area
    this.contentContainer = this.add.container(50, 120);
    this.mainContainer.add(this.contentContainer);
    
    // Navigation buttons
    this.createNavigationButtons();
    
    // Show first step
    this.showStep(0);
  }
  
  /**
   * Create preview panel showing character appearance
   */
  createPreviewPanel() {
    const previewX = 800;
    const previewY = 200;
    
    // Frame
    this.add.rectangle(previewX, previewY, 180, 300, 0x1a1a1a, 0.9);
    this.add.rectangle(previewX, previewY, 180, 300, 0xff6b6b, 0.2).setStrokeStyle(2, 0xff6b6b);
    
    // Label
    this.add.text(previewX, previewY - 140, 'Preview', {
      font: 'bold 18px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Character preview graphics
    this.previewGraphics = this.make.graphics({ x: previewX, y: previewY, add: false });
    this.add.existing(this.previewGraphics);
    
    this.updatePreview();
  }
  
  /**
   * Update character preview based on current data
   */
  updatePreview() {
    if (!this.previewGraphics) return;
    
    this.previewGraphics.clear();
    
    const appearance = this.characterData.appearance;
    const previewX = 0;
    const previewY = 0;
    
    // Draw simplified zombie character
    // Head
    const headColor = parseInt(appearance.skinTone.replace('#', '0x'));
    this.previewGraphics.fillStyle(headColor, 1);
    this.previewGraphics.fillCircle(previewX, previewY - 40, 25);
    
    // Eyes
    this.previewGraphics.fillStyle(0x000000, 1);
    this.previewGraphics.fillCircle(previewX - 10, previewY - 45, 5);
    this.previewGraphics.fillCircle(previewX + 10, previewY - 45, 5);
    
    // Body
    this.previewGraphics.fillStyle(headColor, 0.8);
    
    // Draw body based on type
    switch(appearance.bodyType) {
      case 'slim':
        this.previewGraphics.fillRect(previewX - 15, previewY - 15, 30, 50);
        break;
      case 'athletic':
        this.previewGraphics.fillRect(previewX - 18, previewY - 15, 36, 50);
        break;
      case 'curvy':
        this.previewGraphics.fillRect(previewX - 22, previewY - 15, 44, 50);
        break;
      case 'muscular':
        this.previewGraphics.fillRect(previewX - 20, previewY - 15, 40, 55);
        break;
    }
    
    // Arms
    this.previewGraphics.fillRect(previewX - 35, previewY - 10, 15, 40);
    this.previewGraphics.fillRect(previewX + 20, previewY - 10, 15, 40);
    
    // Legs
    this.previewGraphics.fillRect(previewX - 12, previewY + 35, 24, 35);
    
    // Hair indicator
    const hairColor = parseInt(appearance.hairColor.replace('#', '0x'));
    this.previewGraphics.fillStyle(hairColor, 1);
    this.previewGraphics.fillCircle(previewX, previewY - 65, 28);
    
    // Clothing indicator
    if (!this.characterData.clothing.topless) {
      this.previewGraphics.fillStyle(0x4488ff, 0.6);
      this.previewGraphics.fillRect(previewX - 18, previewY - 15, 36, 35);
    }
  }
  
  /**
   * Show specific creation step
   */
  showStep(stepIndex) {
    this.currentStep = stepIndex;
    this.contentContainer.removeAll(true);
    this.updateProgressBar();
    
    const step = this.steps[stepIndex];
    
    switch(step) {
      case 'name':
        this.createNameStep();
        break;
      case 'bodyType':
        this.createBodyTypeStep();
        break;
      case 'skinTone':
        this.createSkinToneStep();
        break;
      case 'hairCustomization':
        this.createHairStep();
        break;
      case 'faceCustomization':
        this.createFaceStep();
        break;
      case 'nsfw':
        this.createNSFWStep();
        break;
      case 'clothing':
        this.createClothingStep();
        break;
      case 'backstory':
        this.createBackstoryStep();
        break;
      case 'personality':
        this.createPersonalityStep();
        break;
      case 'skills':
        this.createSkillsStep();
        break;
      case 'review':
        this.createReviewStep();
        break;
    }
  }
  
  /**
   * Name input step
   */
  createNameStep() {
    const title = this.add.text(0, 0, 'What is your name?', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const label = this.add.text(0, 50, 'Character Name:', {
      font: '18px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(label);
    
    // Input field (using DOM element)
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'characterNameInput';
    input.placeholder = 'Enter your name...';
    input.value = this.characterData.name;
    input.style.cssText = `
      position: absolute;
      left: 100px;
      top: 380px;
      width: 300px;
      padding: 10px;
      font-size: 16px;
      background: #333;
      color: #fff;
      border: 2px solid #ff6b6b;
      border-radius: 4px;
    `;
    
    document.body.appendChild(input);
    this.nameInput = input;
    
    const hint = this.add.text(0, 80, 'Your name will be your identity in this new world.', {
      font: 'italic 14px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(hint);
  }
  
  /**
   * Body type selection step
   */
  createBodyTypeStep() {
    const title = this.add.text(0, 0, 'Select Body Type', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const bodyTypes = [
      { key: 'slim', label: 'Slim - Faster movement' },
      { key: 'athletic', label: 'Athletic - Balanced' },
      { key: 'curvy', label: 'Curvy - More allure' },
      { key: 'muscular', label: 'Muscular - Stronger attacks' }
    ];
    
    let yPos = 60;
    bodyTypes.forEach(type => {
      const isSelected = this.characterData.appearance.bodyType === type.key;
      const button = this.createSelectionButton(0, yPos, type.label, isSelected, 400, () => {
        this.characterData.appearance.bodyType = type.key;
        this.updatePreview();
        this.createBodyTypeStep(); // Refresh to show selection
      });
      this.contentContainer.add(button);
      yPos += 60;
    });
  }
  
  /**
   * Skin tone selection step
   */
  createSkinToneStep() {
    const title = this.add.text(0, 0, 'Select Skin Tone', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const tones = [
      { color: '#F4A460', label: 'Light' },
      { color: '#8B4513', label: 'Medium' },
      { color: '#654321', label: 'Dark' },
      { color: '#2F4F4F', label: 'Deep' },
      { color: '#4A4A4A', label: 'Undead' }
    ];
    
    let yPos = 60;
    tones.forEach(tone => {
      const isSelected = this.characterData.appearance.skinTone === tone.color;
      
      // Color preview circle
      const circle = this.add.graphics();
      circle.fillStyle(parseInt(tone.color.replace('#', '0x')), 1);
      circle.fillCircle(0, yPos + 15, 15);
      this.contentContainer.add(circle);
      
      const label = this.add.text(40, yPos, tone.label, {
        font: 'bold 16px Arial',
        fill: '#ffffff'
      });
      this.contentContainer.add(label);
      
      // Selection indicator
      if (isSelected) {
        const check = this.add.text(350, yPos, '✓ SELECTED', {
          font: 'bold 14px Arial',
          fill: '#ff6b6b'
        });
        this.contentContainer.add(check);
      }
      
      // Click area
      const button = this.add.rectangle(180, yPos + 15, 300, 40, 0x000000, 0);
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        this.characterData.appearance.skinTone = tone.color;
        this.updatePreview();
        this.createSkinToneStep();
      });
      this.contentContainer.add(button);
      
      yPos += 60;
    });
  }
  
  /**
   * Hair customization step
   */
  createHairStep() {
    const title = this.add.text(0, 0, 'Hair Customization', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    // Hair color
    const colorLabel = this.add.text(0, 50, 'Hair Color:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(colorLabel);
    
    const hairColors = ['#000000', '#8B4513', '#FFD700', '#FF6B6B', '#FFFFFF'];
    let xPos = 0;
    hairColors.forEach(color => {
      const circle = this.add.graphics();
      circle.fillStyle(parseInt(color.replace('#', '0x')), 1);
      circle.fillCircle(xPos, 90, 15);
      this.contentContainer.add(circle);
      
      const isSelected = this.characterData.appearance.hairColor === color;
      if (isSelected) {
        circle.strokeStyle(0xffff00, 3);
        circle.strokeCircle(xPos, 90, 20);
      }
      
      const button = this.add.rectangle(xPos, 90, 40, 40, 0x000000, 0);
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        this.characterData.appearance.hairColor = color;
        this.updatePreview();
        this.createHairStep();
      });
      this.contentContainer.add(button);
      
      xPos += 70;
    });
    
    // Hair style
    const styleLabel = this.add.text(0, 140, 'Hair Style:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(styleLabel);
    
    const styles = ['short', 'medium', 'long', 'wavy', 'curly'];
    let yPos = 180;
    styles.forEach(style => {
      const isSelected = this.characterData.appearance.hairStyle === style;
      const button = this.createSelectionButton(0, yPos, style.charAt(0).toUpperCase() + style.slice(1), isSelected, 300, () => {
        this.characterData.appearance.hairStyle = style;
        this.updatePreview();
        this.createHairStep();
      });
      this.contentContainer.add(button);
      yPos += 50;
    });
  }
  
  /**
   * Face customization step
   */
  createFaceStep() {
    const title = this.add.text(0, 0, 'Face Customization', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const eyeColors = [
      { color: '#6B4423', label: 'Brown' },
      { color: '#4A90E2', label: 'Blue' },
      { color: '#2ECC71', label: 'Green' },
      { color: '#E74C3C', label: 'Red (Zombie)' },
      { color: '#F39C12', label: 'Amber' }
    ];
    
    const label = this.add.text(0, 50, 'Eye Color:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(label);
    
    let yPos = 100;
    eyeColors.forEach(eye => {
      const isSelected = this.characterData.appearance.eyeColor === eye.color;
      
      // Color circle
      const circle = this.add.graphics();
      circle.fillStyle(parseInt(eye.color.replace('#', '0x')), 1);
      circle.fillCircle(15, yPos + 10, 12);
      this.contentContainer.add(circle);
      
      const text = this.add.text(40, yPos, eye.label, {
        font: '14px Arial',
        fill: '#ffffff'
      });
      this.contentContainer.add(text);
      
      if (isSelected) {
        const check = this.add.text(300, yPos, '✓', {
          font: 'bold 18px Arial',
          fill: '#ff6b6b'
        });
        this.contentContainer.add(check);
      }
      
      const button = this.add.rectangle(150, yPos + 10, 300, 35, 0x000000, 0);
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        this.characterData.appearance.eyeColor = eye.color;
        this.updatePreview();
        this.createFaceStep();
      });
      this.contentContainer.add(button);
      
      yPos += 50;
    });
  }
  
  /**
   * NSFW customization step
   */
  createNSFWStep() {
    const title = this.add.text(0, 0, 'Physical Customization (NSFW)', {
      font: 'bold 32px Arial',
      fill: '#ff6b6b'
    });
    this.contentContainer.add(title);
    
    const hint = this.add.text(0, 50, 'This game contains adult content. Customize as you wish.', {
      font: 'italic 14px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(hint);
    
    // Breast size
    const breastLabel = this.add.text(0, 100, 'Breast Size:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(breastLabel);
    
    const breastSizes = [
      { key: 'small', label: 'Small' },
      { key: 'medium', label: 'Medium' },
      { key: 'large', label: 'Large' }
    ];
    
    let yPos = 140;
    breastSizes.forEach(size => {
      const isSelected = this.characterData.appearance.nsfw.breastSize === size.key;
      const button = this.createSelectionButton(0, yPos, size.label, isSelected, 300, () => {
        this.characterData.appearance.nsfw.breastSize = size.key;
        this.createNSFWStep();
      });
      this.contentContainer.add(button);
      yPos += 50;
    });
    
    // Pubic style
    const pubicLabel = this.add.text(0, yPos + 10, 'Pubic Style:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(pubicLabel);
    
    const pubicStyles = [
      { key: 'none', label: 'None' },
      { key: 'trimmed', label: 'Trimmed' },
      { key: 'natural', label: 'Natural' },
      { key: 'shaved', label: 'Shaved' }
    ];
    
    yPos += 50;
    pubicStyles.forEach(style => {
      const isSelected = this.characterData.appearance.nsfw.pubicStyle === style.key;
      const button = this.createSelectionButton(0, yPos, style.label, isSelected, 300, () => {
        this.characterData.appearance.nsfw.pubicStyle = style.key;
        this.createNSFWStep();
      });
      this.contentContainer.add(button);
      yPos += 50;
    });
  }
  
  /**
   * Clothing customization step
   */
  createClothingStep() {
    const title = this.add.text(0, 0, 'Clothing Customization', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const toplessLabel = this.add.text(0, 60, 'Topless:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(toplessLabel);
    
    const toplessButton = this.createToggleButton(0, 100, this.characterData.clothing.topless, (value) => {
      this.characterData.clothing.topless = value;
      this.updatePreview();
      this.createClothingStep();
    });
    this.contentContainer.add(toplessButton);
    
    const pantslessLabel = this.add.text(0, 160, 'Pantsless:', {
      font: 'bold 16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(pantslessLabel);
    
    const pantslessButton = this.createToggleButton(0, 200, this.characterData.clothing.pantsless, (value) => {
      this.characterData.clothing.pantsless = value;
      this.updatePreview();
      this.createClothingStep();
    });
    this.contentContainer.add(pantslessButton);
    
    const note = this.add.text(0, 270, 'Note: Clothing affects visibility in stealth sections.', {
      font: 'italic 12px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(note);
  }
  
  /**
   * Backstory input step
   */
  createBackstoryStep() {
    const title = this.add.text(0, 0, 'Write Your Backstory', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const hint = this.add.text(0, 50, 'Who were you before? How did you become a zombie? Your story matters.', {
      font: 'italic 14px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(hint);
    
    // Textarea
    const textarea = document.createElement('textarea');
    textarea.id = 'backstoryInput';
    textarea.placeholder = 'Write your backstory (min 50 characters)...';
    textarea.value = this.characterData.backstory;
    textarea.style.cssText = `
      position: absolute;
      left: 100px;
      top: 380px;
      width: 500px;
      height: 150px;
      padding: 10px;
      font-size: 14px;
      background: #333;
      color: #fff;
      border: 2px solid #ff6b6b;
      border-radius: 4px;
      font-family: Arial;
      resize: none;
    `;
    
    document.body.appendChild(textarea);
    this.backstoryInput = textarea;
    
    const charCount = this.add.text(0, 300, `Characters: ${this.characterData.backstory.length}`, {
      font: '12px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(charCount);
  }
  
  /**
   * Personality selection step
   */
  createPersonalityStep() {
    const title = this.add.text(0, 0, 'Select Personality', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const hint = this.add.text(0, 50, 'How do you interact with others?', {
      font: 'italic 14px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(hint);
    
    const personalities = [
      { key: 'neutral', label: 'Neutral', desc: 'Cautious and balanced' },
      { key: 'aggressive', label: 'Aggressive', desc: 'Dominating and fierce' },
      { key: 'compassionate', label: 'Compassionate', desc: 'Empathetic and caring' },
      { key: 'cunning', label: 'Cunning', desc: 'Strategic and manipulative' }
    ];
    
    let yPos = 120;
    personalities.forEach(p => {
      const isSelected = this.characterData.personality === p.key;
      const button = this.add.rectangle(0, yPos + 20, 400, 50, isSelected ? 0xff6b6b : 0x333333, 0.7);
      button.setStrokeStyle(2, isSelected ? 0xff6b6b : 0x666666);
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        this.characterData.personality = p.key;
        this.createPersonalityStep();
      });
      this.contentContainer.add(button);
      
      const label = this.add.text(-180, yPos, p.label, {
        font: 'bold 16px Arial',
        fill: '#ffffff'
      });
      this.contentContainer.add(label);
      
      const desc = this.add.text(-180, yPos + 20, p.desc, {
        font: '12px Arial',
        fill: '#cccccc'
      });
      this.contentContainer.add(desc);
      
      yPos += 70;
    });
  }
  
  /**
   * Skills selection step
   */
  createSkillsStep() {
    const title = this.add.text(0, 0, 'Select Starting Skills', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    const hint = this.add.text(0, 50, 'Choose 2 skills to start with', {
      font: 'italic 14px Arial',
      fill: '#888888'
    });
    this.contentContainer.add(hint);
    
    const skills = [
      { key: 'crafting', name: 'Master Crafter', desc: 'Faster crafting' },
      { key: 'combat', name: 'Fighter', desc: 'Better combat' },
      { key: 'stealth', name: 'Infiltrator', desc: 'Better stealth' },
      { key: 'herbalism', name: 'Herbalist', desc: 'Better marijuana usage' },
      { key: 'tracking', name: 'Tracker', desc: 'Better resource finding' },
      { key: 'charisma', name: 'Charmer', desc: 'Better NPC relations' }
    ];
    
    let yPos = 120;
    skills.forEach(skill => {
      const isSelected = this.characterData.skills.includes(skill.key);
      const canSelect = !isSelected && this.characterData.skills.length >= 2;
      
      const button = this.add.rectangle(0, yPos + 20, 400, 50, isSelected ? 0xff6b6b : 0x333333, canSelect ? 0.3 : 0.7);
      button.setStrokeStyle(2, isSelected ? 0xffff00 : 0x666666);
      if (!canSelect) {
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => {
          if (isSelected) {
            this.characterData.skills = this.characterData.skills.filter(s => s !== skill.key);
          } else if (this.characterData.skills.length < 2) {
            this.characterData.skills.push(skill.key);
          }
          this.createSkillsStep();
        });
      }
      this.contentContainer.add(button);
      
      const label = this.add.text(-180, yPos, skill.name + (isSelected ? ' ✓' : ''), {
        font: 'bold 16px Arial',
        fill: '#ffffff'
      });
      this.contentContainer.add(label);
      
      const desc = this.add.text(-180, yPos + 20, skill.desc, {
        font: '12px Arial',
        fill: '#cccccc'
      });
      this.contentContainer.add(desc);
      
      yPos += 70;
    });
  }
  
  /**
   * Review and confirm step
   */
  createReviewStep() {
    const title = this.add.text(0, 0, 'Confirm Your Character', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    this.contentContainer.add(title);
    
    let yPos = 60;
    
    // Name
    const nameText = this.add.text(0, yPos, `Name: ${this.characterData.name || 'Not set'}`, {
      font: '16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(nameText);
    yPos += 40;
    
    // Body type
    const bodyText = this.add.text(0, yPos, `Body Type: ${this.characterData.appearance.bodyType}`, {
      font: '16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(bodyText);
    yPos += 40;
    
    // Personality
    const personalityText = this.add.text(0, yPos, `Personality: ${this.characterData.personality}`, {
      font: '16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(personalityText);
    yPos += 40;
    
    // Skills
    const skillsText = this.add.text(0, yPos, `Skills: ${this.characterData.skills.join(', ') || 'None'}`, {
      font: '16px Arial',
      fill: '#cccccc'
    });
    this.contentContainer.add(skillsText);
    yPos += 60;
    
    // Confirm button
    const confirmButton = this.add.rectangle(0, yPos, 300, 50, 0x2ecc71, 0.8);
    confirmButton.setStrokeStyle(2, 0x27ae60);
    confirmButton.setInteractive({ useHandCursor: true });
    confirmButton.on('pointerdown', () => this.confirmCharacter());
    this.contentContainer.add(confirmButton);
    
    const confirmText = this.add.text(0, yPos, 'Begin Game', {
      font: 'bold 16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this.contentContainer.add(confirmText);
  }
  
  /**
   * Create a selection button
   */
  createSelectionButton(x, y, label, isSelected, width, onClick) {
    const button = this.add.rectangle(x, y, width, 45, isSelected ? 0xff6b6b : 0x333333, 0.7);
    button.setStrokeStyle(2, isSelected ? 0xff6b6b : 0x666666);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', onClick);
    
    const text = this.add.text(x, y, label + (isSelected ? ' ✓' : ''), {
      font: 'bold 14px Arial',
      fill: isSelected ? '#000000' : '#ffffff'
    }).setOrigin(0.5);
    
    return this.add.container(0, 0, [button, text]);
  }
  
  /**
   * Create a toggle button
   */
  createToggleButton(x, y, isActive, onChange) {
    const button = this.add.rectangle(x, y, 200, 40, isActive ? 0x2ecc71 : 0xe74c3c, 0.7);
    button.setStrokeStyle(2, isActive ? 0x27ae60 : 0xc0392b);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => onChange(!isActive));
    
    const text = this.add.text(x, y, isActive ? 'YES' : 'NO', {
      font: 'bold 16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    return this.add.container(0, 0, [button, text]);
  }
  
  /**
   * Update progress bar
   */
  updateProgressBar() {
    this.progressBar.clear();
    const progress = (this.currentStep / (this.steps.length - 1)) * 400;
    this.progressBar.fillStyle(0x666666, 0.5);
    this.progressBar.fillRect(50, 110, 400, 8);
    this.progressBar.fillStyle(0xff6b6b, 1);
    this.progressBar.fillRect(50, 110, progress, 8);
  }
  
  /**
   * Confirm character and start game
   */
  confirmCharacter() {
    // Collect data from input fields
    if (this.nameInput) {
      this.characterData.name = this.nameInput.value;
      this.nameInput.remove();
    }
    
    if (this.backstoryInput) {
      this.characterData.backstory = this.backstoryInput.value;
      this.backstoryInput.remove();
    }
    
    // Validate
    if (!this.characterData.name || this.characterData.name.length < 1) {
      alert('Please enter a name');
      return;
    }
    
    if (this.characterData.backstory.length < 50) {
      alert('Backstory must be at least 50 characters');
      return;
    }
    
    // Save character data
    PlayerDataManager.setCharacter(this.characterData);
    
    // Clean up any remaining inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.remove());
    
    // Start game
    this.scene.start('GameScene', { characterData: this.characterData });
  }
  
  /**
   * Navigate to next step
   */
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }
  
  /**
   * Navigate to previous step
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  /**
   * Create navigation buttons
   */
  createNavigationButtons() {
    // Previous button
    const prevButton = this.add.rectangle(100, 700, 120, 50, 0x3498db, 0.8);
    prevButton.setStrokeStyle(2, 0x2980b9);
    prevButton.setInteractive({ useHandCursor: true });
    prevButton.on('pointerdown', () => this.previousStep());
    
    const prevText = this.add.text(100, 700, '← Previous', {
      font: 'bold 14px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Next button
    const nextButton = this.add.rectangle(924, 700, 120, 50, 0x3498db, 0.8);
    nextButton.setStrokeStyle(2, 0x2980b9);
    nextButton.setInteractive({ useHandCursor: true });
    nextButton.on('pointerdown', () => {
      if (this.currentStep === this.steps.length - 1) {
        this.confirmCharacter();
      } else {
        this.nextStep();
      }
    });
    
    const nextText = this.add.text(924, 700, this.currentStep === this.steps.length - 1 ? 'Begin' : 'Next →', {
      font: 'bold 14px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
}

export default CharacterCreationScene;
