# Guide de Développement - Rugby Simulator

## 🚀 Setup Environnement

### Prérequis
- **Node.js** : Version 16+ 
- **npm/yarn** : Gestionnaire de packages
- **Git** : Contrôle de version
- **VS Code** : IDE recommandé avec extensions TypeScript

### Installation Rapide
```bash
# Clone et setup
git clone <repo-url>
cd rugby-simulator
npm install
npm run dev
```

### Extensions VS Code Recommandées
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

## 📁 Structure du Code

### Organisation des Fichiers
```
src/
├── game/
│   ├── entities/         # Entités de jeu (Player, Ball)
│   ├── managers/         # Logique métier (GameManager, LevelManager)
│   └── systems/          # Systèmes transversaux (futur)
├── scenes/               # Scènes Phaser.js
├── types/                # Définitions TypeScript
├── utils/                # Utilitaires partagés
└── index.ts             # Entry point
```

### Conventions de Nommage
- **Classes** : PascalCase (`GameManager`, `Player`)
- **Interfaces** : PascalCase + I prefix (`IPlayerData` → `PlayerData`)
- **Enums** : PascalCase (`PlayerAction`, `GameState`)
- **Variables** : camelCase (`ballPosition`, `selectedPlayer`)
- **Constants** : SCREAMING_SNAKE_CASE (`MAX_PLAYERS`, `FIELD_WIDTH`)
- **Files** : PascalCase (`GameScene.ts`, `Player.ts`)

## 🧩 Ajout de Nouvelles Fonctionnalités

### 1. Ajouter une Nouvelle Action Joueur

**Étape 1** : Étendre l'enum `PlayerAction`
```typescript
// types/index.ts
export enum PlayerAction {
  SKIP = 'skip',
  RUN = 'run',
  PASS = 'pass',
  KICK = 'kick',
  TACKLE = 'tackle'  // ← Nouvelle action
}
```

**Étape 2** : Modifier `GameManager.executePlayerMovement()`
```typescript
private async executePlayerMovement(player: PlayerData, instruction: PlayerInstruction): Promise<void> {
  switch (instruction.action) {
    // ... existing cases
    case PlayerAction.TACKLE:
      await this.executeTackle(player, instruction.target);
      break;
  }
}
```

**Étape 3** : Implémenter la logique
```typescript
private async executeTackle(player: PlayerData, target: Position): Promise<void> {
  // Logique de plaquage
}
```

**Étape 4** : Mettre à jour l'interface utilisateur
```typescript
// GameScene.ts - dans showActionMenu()
private showActionMenu(): void {
  // Afficher l'option tackle
}
```

### 2. Ajouter un Nouveau Type de Joueur

**Étape 1** : Étendre `PlayerStats`
```typescript
// types/index.ts
export interface PlayerStats {
  force: number;
  vitesse: number;
  agilite: number;    // ← Nouvelle stat
  precision: number;  // ← Nouvelle stat
}
```

**Étape 2** : Créer un enum pour les postes
```typescript
export enum PlayerPosition {
  PILIER = 'pilier',
  TALONNEUR = 'talonneur',
  AILIER = 'ailier',
  ARRIERE = 'arriere'
}
```

**Étape 3** : Factory pour créer les joueurs
```typescript
export class PlayerFactory {
  static createByPosition(position: PlayerPosition): PlayerStats {
    switch (position) {
      case PlayerPosition.PILIER:
        return { force: 90, vitesse: 60, agilite: 40, precision: 50 };
      case PlayerPosition.AILIER:
        return { force: 60, vitesse: 95, agilite: 85, precision: 70 };
      // ...
    }
  }
}
```

### 3. Créer une Nouvelle Scène

**Étape 1** : Créer le fichier de scène
```typescript
// scenes/SettingsScene.ts
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    // Implementation
  }
}
```

**Étape 2** : L'enregistrer dans la config
```typescript
// index.ts
const config: Phaser.Types.Core.GameConfig = {
  // ...
  scene: [MenuScene, GameScene, LevelEditorScene, SettingsScene]
};
```

**Étape 3** : Ajouter la navigation
```typescript
// MenuScene.ts
const settingsButton = this.add.text(/* ... */)
  .on('pointerdown', () => {
    this.scene.start('SettingsScene');
  });
```

## 🎨 Système de Sprites et Assets

### Organisation des Assets
```
assets/
├── sprites/
│   ├── players/          # Sprites des joueurs
│   ├── ui/              # Interface utilisateur
│   └── effects/         # Effets visuels
├── audio/
│   ├── sfx/             # Effets sonores
│   └── music/           # Musiques
└── data/
    └── levels/          # Niveaux par défaut
```

### Chargement des Assets
```typescript
export class PreloadScene extends Phaser.Scene {
  preload(): void {
    // Images
    this.load.image('player-attack', 'assets/sprites/player-blue.png');
    this.load.image('player-defense', 'assets/sprites/player-red.png');
    
    // Spritesheets
    this.load.spritesheet('player-run', 'assets/sprites/player-run.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    
    // Audio
    this.load.audio('whistle', 'assets/audio/sfx/whistle.ogg');
  }
}
```

### Remplacement des Rectangles par Sprites
```typescript
// Player.ts - Modifier le constructeur
constructor(scene: Phaser.Scene, data: PlayerData) {
  const spriteKey = data.team === Team.ATTACK ? 'player-attack' : 'player-defense';
  super(scene, data.position.x, data.position.y, spriteKey);
  
  // Configuration du sprite
  this.setOrigin(0.5);
  this.setScale(0.8);
  
  scene.add.existing(this);
}
```

## 🤖 Amélioration de l'IA

### IA Défensive Basique → Avancée

**Structure actuelle** :
```typescript
// Simple : tous vers le porteur
private calculateDefensePosition(defender: PlayerData, ballPosition: Position): Position {
  // Mouvement direct vers le porteur
}
```

**Structure avancée** :
```typescript
interface DefenseStrategy {
  name: string;
  calculatePosition(defender: PlayerData, gameState: GameState): Position;
  priority: number;
}

class RushDefenseStrategy implements DefenseStrategy {
  calculatePosition(defender: PlayerData, gameState: GameState): Position {
    // Montée agressive
  }
}

class DriftDefenseStrategy implements DefenseStrategy {
  calculatePosition(defender: PlayerData, gameState: GameState): Position {
    // Défense en dérive
  }
}
```

### Système de Poids pour Décisions
```typescript
interface DecisionWeight {
  ballCarrierCover: number;      // Couverture du porteur
  supportPlayersCover: number;   // Couverture des soutiens
  lineIntegrity: number;        // Intégrité de la ligne
  territorialGain: number;      // Gain territorial
}

class AIDecisionMaker {
  calculateBestPosition(defender: PlayerData, weights: DecisionWeight): Position {
    // Calcul pondéré de la meilleure position
  }
}
```

## 🔧 Debug et Outils de Développement

### Console Debug
```typescript
// Activation du mode debug
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Game state:', this.gameManager.getGameState());
  console.log('Players positions:', this.getAllPlayersPositions());
}
```

### Debug Visuel
```typescript
// GameScene.ts
private createDebugGraphics(): void {
  if (!DEBUG) return;
  
  this.debugGraphics = this.add.graphics();
  
  // Afficher les zones de contact
  this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
  this.players.forEach(player => {
    this.debugGraphics.strokeCircle(player.x, player.y, 30);
  });
}
```

### Commandes de Test
```typescript
// Ajouter dans GameScene.create()
if (DEBUG) {
  this.input.keyboard.on('keydown-T', () => {
    // Téléporter un joueur
    const player = this.players.get(1);
    if (player) {
      player.setPosition(500, 100);
    }
  });
  
  this.input.keyboard.on('keydown-W', () => {
    // Win automatique
    this.gameManager.forceWin();
  });
}
```

## 🧪 Tests

### Structure des Tests
```
tests/
├── unit/
│   ├── managers/         # Tests des managers
│   ├── entities/         # Tests des entités
│   └── utils/           # Tests des utilitaires
├── integration/
│   └── game-flow.test.ts # Tests de flux complet
└── e2e/
    └── gameplay.test.ts  # Tests end-to-end
```

### Exemple de Test Unitaire
```typescript
// tests/unit/managers/GameManager.test.ts
import { GameManager } from '@/game/managers/GameManager';
import { createMockLevel } from '../helpers/mockData';

describe('GameManager', () => {
  let gameManager: GameManager;
  
  beforeEach(() => {
    gameManager = new GameManager(mockFieldConfig);
  });
  
  test('should initialize level correctly', () => {
    const level = createMockLevel();
    gameManager.initializeLevel(level);
    
    expect(gameManager.getAttackPlayers().size).toBe(5);
    expect(gameManager.getDefensePlayers().size).toBe(5);
  });
  
  test('should execute valid instruction', async () => {
    const instruction = {
      playerId: 1,
      action: PlayerAction.RUN,
      target: { x: 100, y: 100 }
    };
    
    gameManager.addInstruction(instruction);
    await gameManager.executeTurn();
    
    const player = gameManager.getAttackPlayers().get(1);
    expect(player?.position).toEqual({ x: 100, y: 100 });
  });
});
```

## 📊 Performance

### Profiling
```typescript
// Mesurer les performances
class PerformanceProfiler {
  private static measurements: Map<string, number> = new Map();
  
  static start(label: string): void {
    this.measurements.set(label, performance.now());
  }
  
  static end(label: string): number {
    const start = this.measurements.get(label);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }
}

// Utilisation
PerformanceProfiler.start('turn-execution');
await this.gameManager.executeTurn();
PerformanceProfiler.end('turn-execution');
```

### Object Pooling
```typescript
// Pool d'objets pour les effets visuels
class EffectPool {
  private pool: Phaser.GameObjects.Sprite[] = [];
  
  getEffect(): Phaser.GameObjects.Sprite {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.scene.add.sprite(0, 0, 'effect');
  }
  
  returnEffect(effect: Phaser.GameObjects.Sprite): void {
    effect.setVisible(false);
    this.pool.push(effect);
  }
}
```

## 🔄 Workflow Git

### Branches
- `main` : Production stable
- `develop` : Développement principal
- `feature/nom-fonctionnalite` : Nouvelles fonctionnalités
- `bugfix/nom-bug` : Corrections de bugs
- `hotfix/nom-fix` : Corrections urgentes

### Commits Conventionnels
```
feat: ajouter système de plaquage
fix: corriger calcul de distance
refactor: optimiser GameManager
docs: mettre à jour README
test: ajouter tests pour Player
style: formater code selon ESLint
```

### Workflow
```bash
# Nouvelle fonctionnalité
git checkout develop
git pull origin develop
git checkout -b feature/nouvelle-action
# ... développement ...
git add .
git commit -m "feat: ajouter action de plaquage"
git push origin feature/nouvelle-action
# → Pull Request vers develop
```

Ce guide vous donne toutes les clés pour développer efficacement sur le Rugby Simulator ! 🚀