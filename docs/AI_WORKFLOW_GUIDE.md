# Guide IA - Workflows & Patterns Complexes

## 🤖 Guide pour Future IA

Ce document explique les **patterns complexes** et **workflows** du Rugby Simulator pour qu'une IA puisse rapidement comprendre et modifier le code.

## 🔄 **WORKFLOWS PRINCIPAUX**

### 1. **Cycle de Jeu Complet**
```
Sélection Joueur → Direction → Exécution → Détection Collision/Essai → Réinitialisation

Player.onClick() 
  ↓
GameScene.selectPlayer() 
  ↓
GameScene.showActionMenu() (flèche pivotante)
  ↓
GameScene.confirmArrowDirection()
  ↓
GameManager.addInstruction()
  ↓
[Clic "Exécuter"]
  ↓
GameManager.executeTurn()
  ↓
GameManager.executeAttackMovements()
  ↓
GameManager.movePlayer() (avec steps progressifs)
  ↓
GameManager.resolveContacts() (à chaque step)
  ↓
[Si plaquage] → onTackleCallback → GameScene.handleTackle() → scene.restart()
[Si essai]    → onTryScoreCallback → GameScene.handleTryScore() → scene.restart()
```

### 2. **Système de Callbacks (Récent)**
```typescript
// Dans GameManager - Pattern Observer
private onTackleCallback: (() => void) | null = null;
private onTryScoreCallback: (() => void) | null = null;

// Enregistrement dans GameScene.create()
this.gameManager.setOnTackleCallback(() => this.handleTackle());
this.gameManager.setOnTryScoreCallback(() => this.handleTryScore());

// Déclenchement dans GameManager.resolveContacts() et movePlayer()
if (this.onTackleCallback) this.onTackleCallback();
if (this.onTryScoreCallback) this.onTryScoreCallback();
```

### 3. **Système de Mouvement Progressive (Anti-Bug)**
```typescript
// GameManager.movePlayer() - Évite les collisions manquées
for (let i = 0; i < steps; i++) {
  // 1. Calculer nouvelle position
  player.position = { x: newX, y: newY };
  
  // 2. Vérifier collisions à CHAQUE étape
  this.resolveContacts();
  
  // 3. Arrêter si plaqué
  if (this.ballCarrierId === null) return;
  
  // 4. Arrêter si essai
  if (this.checkWinCondition()) {
    this.onTryScoreCallback?.();
    return;
  }
}
```

## 🎯 **PATTERNS DE MODIFICATION**

### ➕ **Ajouter une Nouvelle Action**

**1. Étendre l'enum :**
```typescript
// types/index.ts
export enum PlayerAction {
  // ... existing
  TACKLE = 'tackle',
  RUCK = 'ruck'
}
```

**2. Ajouter case dans GameManager :**
```typescript
// GameManager.executePlayerMovement()
case PlayerAction.TACKLE:
  await this.executeTackle(player, instruction.target);
  break;
```

**3. Implémenter la logique :**
```typescript
private async executeTackle(player: PlayerData, target: Position): Promise<void> {
  // Votre logique ici
}
```

### 🔄 **Ajouter un Nouveau Callback d'Événement**

**1. Dans GameManager :**
```typescript
private onRuckCallback: (() => void) | null = null;

public setOnRuckCallback(callback: () => void): void {
  this.onRuckCallback = callback;
}
```

**2. Dans GameScene.create() :**
```typescript
this.gameManager.setOnRuckCallback(() => this.handleRuck());
```

**3. Nouvelle méthode GameScene :**
```typescript
private handleRuck(): void {
  // Affichage + logique
}
```

### 🎨 **Modifier l'Interface (Flèche Directionnelle)**

Le système actuel dans `GameScene.createDirectionalMenu()` :
```typescript
// État de la flèche
let isArrowActive = false;

// 1er clic = Déplier
centerButton.on('pointerdown', () => {
  isArrowActive = !isArrowActive;
  // Montrer/cacher flèche
});

// Mouvement souris = Rotation
this.input.on('pointermove', (pointer) => {
  if (isArrowActive) {
    arrowAngle = Phaser.Math.Angle.Between(centerX, centerY, pointer.x, pointer.y);
    // Mettre à jour position flèche
  }
});

// 2ème clic = Confirmer
this.input.on('pointerdown', (pointer) => {
  if (isArrowActive && !centerButton.getBounds().contains(pointer.x, pointer.y)) {
    this.confirmArrowDirection(arrowAngle);
  }
});
```

## 🧠 **ÉTAT DU JEU - Où Trouver Quoi**

### 📊 **GameManager (Source de Vérité)**
```typescript
// Joueurs et leurs états
private attackPlayers: Map<number, PlayerData>    // Position, stats, hasBall
private defensePlayers: Map<number, PlayerData>
private ballCarrierId: number | null              // Qui a le ballon
private ballPosition: Position                     // Position du ballon
private tackedPlayers: Set<number>                // Joueurs plaqués (immobiles)
private currentInstructions: Map<number, PlayerInstruction>  // Ordres en attente
```

### 🎮 **GameScene (Interface/Visuel)**
```typescript
private players: Map<number, Player>              // Entités visuelles Phaser
private selectedPlayerId: number | null           // Joueur actuellement sélectionné
private actionMenuContainer: Container | null     // Menu flèche directionnel
```

### 💾 **LevelManager (Persistance)**
```typescript
private levels: Map<string, LevelData>            // Niveaux sauvegardés
// + méthodes CRUD pour localStorage
```

## 🐛 **DEBUGGING - Points Clés**

### 🔍 **Problèmes Fréquents & Solutions**
```typescript
// 1. Collisions manquées
// SOLUTION: movePlayer() avec steps progressifs (ligne ~155 GameManager)

// 2. Callbacks non appelés  
// SOLUTION: Vérifier enregistrement dans GameScene.create()

// 3. Joueur ne s'arrête pas après plaquage
// SOLUTION: Vérifier tackedPlayers.has(id) dans executeAttackMovements()

// 4. Interface flèche bloquée
// SOLUTION: clearActionMenu() pour nettoyer les event listeners
```

### 📝 **Logs Utiles**
```typescript
// Ajouter ces console.log pour debug
console.log('Current game state:', this.gameManager.getGameState());
console.log('Ball carrier:', this.gameManager.getBallCarrierId());
console.log('Player positions:', this.getAllPlayersPositions());
console.log('Tacked players:', Array.from(this.tackedPlayers));
```

## 🔧 **MODIFICATIONS COMMUNES**

### 🎯 **Équilibrage Gameplay**
```typescript
// GameManager.resolveContacts() - ligne ~320
if (distance < 30) // ← Distance de plaquage
const successProbability = Math.min(0.9, 0.5 + (defenderForce - attackerForce) / 200); // ← Formule

// GameManager.executeAttackMovements() - ligne ~100
const targetY = player.position.y - 50; // ← Vitesse d'avancée par défaut

// GameScene.confirmArrowDirection() - ligne ~370
const runDistance = 100; // ← Distance de course par instruction
```

### 🎨 **Interface Utilisateur**
```typescript
// GameScene.createDirectionalMenu() - ligne ~230
const arrowDistance = 80;        // ← Longueur de la flèche
const centerButton = this.add.circle(centerX + 50, centerY, 20); // ← Position bouton (décalé droite)

// GameScene.handleTackle()/handleTryScore() - ligne ~510
fontSize: '72px',               // ← Taille texte événements
delay: 500,                     // ← Temps d'affichage
duration: 1500                  // ← Temps de fade
```

## 🚀 **EXTENSIBILITÉ - Zones Prêtes**

### ➕ **Prêt à Étendre**
- ✅ **Nouvelles actions** : Pattern établi dans PlayerAction enum
- ✅ **Nouveaux événements** : Système de callbacks en place
- ✅ **Nouvelles scènes** : Structure Phaser modulaire
- ✅ **Persistance étendue** : LevelManager avec localStorage

### 🔄 **À Structurer (Futures Modifs)**
- **IA avancée** : Créer `AIManager` séparé de `GameManager`
- **Sprites animés** : Remplacer `Rectangle` par `Sprite` dans `Player.ts`
- **Multijoueur** : Abstraire instructions vers serveur/réseau
- **Sons/FX** : Ajouter `SoundManager` pour événements audio

---

**💡 Conseil IA :** Commencez toujours par lire ce workflow, puis consultez l'API.md pour les signatures exactes des méthodes !