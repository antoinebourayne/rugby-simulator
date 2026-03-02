# API Reference - Rugby Simulator

## 🎯 Vue d'ensemble

Cette documentation décrit l'API interne du Rugby Simulator, utile pour les développeurs souhaitant étendre ou modifier le jeu.

## 📚 Core APIs

### GameManager

Le gestionnaire principal du jeu qui orchestre toute la logique de gameplay.

```typescript
class GameManager {
  constructor(fieldConfig: FieldConfig)
  
  // Gestion des niveaux
  initializeLevel(levelData: LevelData): void
  
  // Gestion des instructions
  addInstruction(instruction: PlayerInstruction): void
  removeInstruction(playerId: number): void
  
  // Exécution du jeu
  executeTurn(): Promise<void>
  
  // État du jeu
  getGameState(): GameState
  getAttackPlayers(): Map<number, PlayerData>
  getDefensePlayers(): Map<number, PlayerData>
  getBallPosition(): Position
  getBallCarrierId(): number | null
}
```

**Exemple d'utilisation :**
```typescript
const gameManager = new GameManager({
  width: 100,
  height: 100,
  pixelsPerMeter: 10
});

// Charger un niveau
gameManager.initializeLevel(levelData);

// Donner des instructions
gameManager.addInstruction({
  playerId: 1,
  action: PlayerAction.RUN,
  target: { x: 500, y: 300 }
});

// Exécuter le tour
await gameManager.executeTurn();
```

### Player Entity

Entité visuelle représentant un joueur sur le terrain.

```typescript
class Player extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, data: PlayerData)
  
  // Interactions
  setSelected(selected: boolean): void
  setBall(hasBall: boolean): void
  
  // Mouvements
  moveTo(position: Position, duration?: number): Promise<void>
  
  // Données
  getData(): PlayerData
  getId(): number
  hasBall(): boolean
  distanceTo(position: Position): number
  getMovementSpeed(): number
}
```

**Exemple d'utilisation :**
```typescript
const playerData = {
  id: 1,
  team: Team.ATTACK,
  position: { x: 100, y: 200 },
  stats: { force: 70, vitesse: 80 },
  hasBall: true
};

const player = new Player(scene, playerData);

// Sélectionner le joueur
player.setSelected(true);

// Déplacer le joueur
await player.moveTo({ x: 300, y: 400 }, 1000);
```

### LevelManager

Gestionnaire de la persistance et du chargement des niveaux.

```typescript
class LevelManager {
  // CRUD operations
  saveLevel(level: LevelData): void
  loadLevel(levelId: string): LevelData | null
  deleteLevel(levelId: string): boolean
  getAllLevels(): LevelData[]
  
  // Création
  createNewLevel(name: string, description: string): LevelData
  createExampleLevel(): LevelData
  
  // Persistance
  loadFromStorage(): void
}
```

**Exemple d'utilisation :**
```typescript
const levelManager = new LevelManager();
levelManager.loadFromStorage();

// Créer un nouveau niveau
const level = levelManager.createNewLevel(
  "Mon Niveau",
  "Description du niveau"
);

// Sauvegarder
levelManager.saveLevel(level);

// Charger
const loadedLevel = levelManager.loadLevel(level.id);
```

## 🎮 Scene APIs

### GameScene

La scène principale du jeu où se déroule l'action.

```typescript
class GameScene extends Phaser.Scene {
  private gameManager: GameManager
  private players: Map<number, Player>
  private selectedPlayerId: number | null
  
  // Méthodes privées importantes
  private selectPlayer(playerId: number): void
  private givePlayerOrder(x: number, y: number): void
  private executeTurn(): Promise<void>
  private updatePlayerPositions(): Promise<void>
  private updateBallPosition(): void
}
```

**Événements émis :**
- `playerSelected` : Quand un joueur est sélectionné
- `instructionGiven` : Quand une instruction est donnée
- `turnExecuted` : Quand un tour est exécuté

### MenuScene

Scène du menu principal avec navigation.

```typescript
class MenuScene extends Phaser.Scene {
  create(): void // Crée l'interface du menu
}
```

## 📊 Types et Interfaces

### Core Types

```typescript
interface Position {
  x: number;
  y: number;
}

interface PlayerStats {
  force: number;    // 0-100
  vitesse: number;  // 0-100
}

interface PlayerData {
  id: number;
  team: Team;
  position: Position;
  stats: PlayerStats;
  hasBall: boolean;
}

interface PlayerInstruction {
  playerId: number;
  action: PlayerAction;
  target?: Position;
}

interface LevelData {
  id: string;
  name: string;
  description: string;
  attackPlayers: PlayerData[];
  defensePlayers: PlayerData[];
  ballPosition: Position;
  created: Date;
  modified: Date;
}
```

### Enums

```typescript
enum PlayerAction {
  SKIP = 'skip',
  RUN = 'run',
  PASS = 'pass',
  KICK = 'kick'
}

enum Team {
  ATTACK = 'attack',
  DEFENSE = 'defense'
}

enum GameState {
  PLANNING = 'planning',
  EXECUTION = 'execution',
  RESULT = 'result',
  GAME_OVER = 'game_over'
}
```

## 🔧 Utility Functions

### GameUtils

```typescript
// Calculs géométriques
function calculateDistance(pos1: Position, pos2: Position): number
function normalizeVector(vector: Position): Position
function calculateAngle(from: Position, to: Position): number

// Validation
function isNearPosition(pos1: Position, pos2: Position, tolerance?: number): boolean
function isValidFieldPosition(position: Position, fieldWidth: number, fieldHeight: number): boolean

// Utilitaires
function clamp(value: number, min: number, max: number): number
function randomBetween(min: number, max: number): number
```

**Exemple d'utilisation :**
```typescript
import { calculateDistance, isValidFieldPosition } from '@/utils/GameUtils';

// Calculer distance entre joueurs
const distance = calculateDistance(player1.position, player2.position);

// Valider position sur terrain
const isValid = isValidFieldPosition(newPosition, 1000, 700);
```

## 🎯 Extension Points

### Ajouter une Nouvelle Action

1. **Étendre l'enum PlayerAction :**
```typescript
enum PlayerAction {
  // ... existing actions
  TACKLE = 'tackle'
}
```

2. **Modifier GameManager.executePlayerMovement() :**
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

3. **Implémenter la logique :**
```typescript
private async executeTackle(player: PlayerData, target: Position): Promise<void> {
  // Logique de plaquage
}
```

### Créer un Nouveau Type de Joueur

```typescript
enum PlayerPosition {
  PILIER = 'pilier',
  AILIER = 'ailier'
}

class PlayerFactory {
  static createByPosition(position: PlayerPosition): PlayerStats {
    switch (position) {
      case PlayerPosition.PILIER:
        return { force: 90, vitesse: 60 };
      case PlayerPosition.AILIER:
        return { force: 60, vitesse: 95 };
    }
  }
}
```

### Implémenter une Nouvelle IA

```typescript
interface DefenseStrategy {
  name: string;
  calculatePosition(defender: PlayerData, gameState: any): Position;
}

class RushDefenseStrategy implements DefenseStrategy {
  name = 'Rush Defense';
  
  calculatePosition(defender: PlayerData, gameState: any): Position {
    // Implémentation stratégie agressive
  }
}
```

## 🔄 Event System

### Événements Disponibles

```typescript
// Dans GameScene
this.events.on('playerSelected', (playerId: number) => {
  // Joueur sélectionné
});

// Dans GameManager (futur)
this.events.emit('ballTransfer', { from: playerId1, to: playerId2 });
this.events.emit('tackle', { attacker: playerId1, defender: playerId2 });
this.events.emit('tryScored', { playerId });
```

### Écouter les Événements

```typescript
// Dans une scène ou composant
scene.events.on('playerSelected', (playerId) => {
  console.log('Player selected:', playerId);
});

scene.events.once('gameOver', () => {
  console.log('Game finished!');
});
```

## 🚀 Performance APIs

### Profiling

```typescript
// Mesurer les performances (à implémenter)
class PerformanceProfiler {
  static start(label: string): void
  static end(label: string): number
  static getMetrics(): PerformanceMetrics
}
```

### Object Pooling

```typescript
// Pool d'objets pour optimisation (à implémenter)
class ObjectPool<T> {
  getObject(): T
  returnObject(obj: T): void
  clear(): void
}
```

Cette API reference vous donne toutes les clés pour développer sur le Rugby Simulator ! 🏉

## 🔗 Liens Utiles

- [Documentation Phaser.js](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Guide de Développement](./DEVELOPMENT.md)
- [Architecture Technique](./ARCHITECTURE.md)