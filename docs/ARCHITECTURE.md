# Architecture Technique - Rugby Simulator

## 📋 Vue d'Ensemble

Le Rugby Simulator est construit selon une architecture modulaire et évolutive, utilisant les meilleures pratiques du développement de jeux web modernes.

## 🏗️ Architecture Générale

### Stack Technique
```
Frontend (Client)
├── Phaser.js 3.70      # Engine de jeu 2D
├── TypeScript 5.3      # Langage principal
├── Webpack 5           # Build & bundling
└── ESLint             # Quality assurance

Future Backend
├── Node.js + Express   # API REST
├── Socket.io          # Real-time multiplayer
└── SQLite/PostgreSQL  # Base de données
```

### Patterns de Conception

#### 1. **Manager Pattern**
Centralisation de la logique métier dans des gestionnaires spécialisés :

```typescript
GameManager     # Logique de jeu, turns, règles
LevelManager    # Gestion des niveaux/scénarios
InputManager    # Gestion des entrées utilisateur (futur)
AIManager       # Intelligence artificielle (futur)
```

#### 2. **Entity-Component Pattern**
Séparation des données et de la représentation visuelle :

```typescript
PlayerData      # Données pures (position, stats, état)
Player          # Entité visuelle Phaser + logique d'affichage
```

#### 3. **Scene Pattern**
Organisation modulaire des écrans :

```typescript
MenuScene       # Menu principal
GameScene       # Jeu principal
LevelEditor     # Éditeur de niveaux
```

#### 4. **State Machine**
Gestion claire des états du jeu :

```typescript
enum GameState {
  PLANNING,     # Planification des ordres
  EXECUTION,    # Exécution des mouvements
  RESULT,       # Affichage des résultats
  GAME_OVER     # Fin de partie
}
```

## 🔧 Composants Principaux

### GameManager
**Responsabilité** : Orchestration du gameplay

```typescript
class GameManager {
  // État du jeu
  private currentState: GameState
  private attackPlayers: Map<number, PlayerData>
  private defensePlayers: Map<number, PlayerData>
  private ballCarrierId: number | null
  
  // Méthodes principales
  initializeLevel(levelData: LevelData): void
  addInstruction(instruction: PlayerInstruction): void
  executeTurn(): Promise<void>
  
  // Logique privée
  private executeAttackMovements(): Promise<void>
  private executeDefenseMovements(): Promise<void>
  private resolveContacts(): void
  private checkWinCondition(): boolean
}
```

### Player Entity
**Responsabilité** : Représentation visuelle et interaction

```typescript
class Player extends Phaser.GameObjects.Rectangle {
  private playerData: PlayerData
  private isSelected: boolean
  
  // Interface utilisateur
  private onPlayerClick(): void
  private onPlayerHover(): void
  
  // Animations
  moveTo(position: Position, duration?: number): Promise<void>
  setSelected(selected: boolean): void
  setBall(hasBall: boolean): void
}
```

### LevelManager
**Responsabilité** : Persistance et gestion des niveaux

```typescript
class LevelManager {
  private levels: Map<string, LevelData>
  
  // CRUD operations
  saveLevel(level: LevelData): void
  loadLevel(levelId: string): LevelData | null
  deleteLevel(levelId: string): boolean
  
  // Persistance
  private persistToStorage(): void
  loadFromStorage(): void
}
```

## 🎯 Flux de Données

### 1. Initialisation
```
MenuScene → GameScene → GameManager.initializeLevel()
                     → LevelManager.loadLevel()
                     → Création des Players visuels
```

### 2. Tour de Jeu
```
User Input → Player.onClick() → GameScene.selectPlayer()
          → User clicks field → GameManager.addInstruction()
          → Execute Button   → GameManager.executeTurn()
                            → Player animations
                            → AI movement
                            → Contact resolution
                            → Win condition check
```

### 3. Sauvegarde
```
Level Editor → LevelManager.saveLevel() → localStorage
Game State   → Auto-save (futur)        → Backend API
```

## 🧩 Système de Types

### Types Principaux
```typescript
interface Position {
  x: number
  y: number
}

interface PlayerData {
  id: number
  team: Team
  position: Position
  stats: PlayerStats
  hasBall: boolean
}

interface PlayerInstruction {
  playerId: number
  action: PlayerAction
  target?: Position
}

interface LevelData {
  id: string
  name: string
  description: string
  attackPlayers: PlayerData[]
  defensePlayers: PlayerData[]
  ballPosition: Position
  created: Date
  modified: Date
}
```

### Enums
```typescript
enum PlayerAction { SKIP, RUN, PASS, KICK }
enum Team { ATTACK, DEFENSE }
enum GameState { PLANNING, EXECUTION, RESULT, GAME_OVER }
```

## 🎨 Système de Rendu

### Phaser.js Scene Hierarchy
```
GameScene
├── Field Graphics     # Terrain de rugby
├── Players Container  # Tous les joueurs
├── Ball Sprite       # Ballon
├── UI Container      # Interface utilisateur
└── Debug Graphics    # Informations de debug
```

### Coordonnées
- **Terrain** : 1000x700 pixels (100m x 70m)
- **Conversion** : 10 pixels = 1 mètre
- **Origine** : Top-left (100, 50) pour centrer sur l'écran

## 🤖 Intelligence Artificielle

### IA Défensive Actuelle (Simple)
```typescript
calculateDefensePosition(defender: PlayerData, ballPosition: Position): Position {
  // 1. Calculer direction vers porteur de ballon
  // 2. Se déplacer selon vitesse du défenseur
  // 3. Respecter formation défensive de base
}
```

### IA Défensive Future (Avancée)
```typescript
// Système de poids multiples
DefenseAI {
  ballCarrierThreat: number      # Menace du porteur
  supportPlayersCover: number    # Couverture des soutiens
  territorialControl: number     # Contrôle territorial
  formationIntegrity: number     # Maintien de formation
}
```

## 🔄 Système d'Événements

### Événements Principaux
```typescript
// Scene Events
'playerSelected'    # Joueur sélectionné
'instructionGiven'  # Instruction donnée
'turnExecuted'      # Tour exécuté
'gameOver'          # Fin de partie

// Game Events
'ballTransfer'      # Transfert de ballon
'tackle'            # Plaquage
'tryScored'         # Essai marqué
```

### Communication Inter-Composants
```
User Input → Scene Events → GameManager → Game Events → Visual Updates
```

## 📊 Performance & Optimisation

### Optimisations Actuelles
- **Object Pooling** : Réutilisation des entités visuelles
- **Event Debouncing** : Limitation des événements répétitifs
- **Lazy Loading** : Chargement différé des assets

### Optimisations Futures
- **Spatial Partitioning** : Optimisation des collisions
- **LOD System** : Niveaux de détail selon la distance
- **Web Workers** : Calculs IA en arrière-plan

## 🧪 Testing Strategy

### Tests Unitaires (Futur)
```typescript
describe('GameManager', () => {
  test('should initialize level correctly')
  test('should execute valid instructions')
  test('should resolve contacts properly')
})
```

### Tests d'Intégration
```typescript
describe('Game Flow', () => {
  test('complete turn execution')
  test('win condition detection')
  test('level loading and saving')
})
```

## 🔐 Sécurité & Validation

### Validation des Données
```typescript
// Position validation
isValidFieldPosition(position: Position): boolean

// Instruction validation
isValidInstruction(instruction: PlayerInstruction): boolean

// Level data integrity
validateLevelData(level: LevelData): ValidationResult
```

### Future Security Measures
- Input sanitization pour le multijoueur
- Rate limiting pour les APIs
- Cheat detection pour les scores

## 🚀 Extensibilité

### Points d'Extension
1. **Nouveau Actions** : Ajouter dans `PlayerAction` enum
2. **Nouveaux Types de Joueurs** : Étendre `PlayerStats`
3. **Nouvelles Règles** : Modifier `GameManager.resolveContacts()`
4. **Nouveaux Modes** : Créer nouvelles `Scene`

### Plugin System (Futur)
```typescript
interface GamePlugin {
  name: string
  initialize(gameManager: GameManager): void
  onTurnStart?(): void
  onTurnEnd?(): void
}
```

Cette architecture garantit un code maintenable, testable et évolutif pour les futures fonctionnalités du Rugby Simulator.