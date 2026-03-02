# 🔄 Historique des Patterns Récents

## Changements Récents (Session Actuelle)

### 1. **Système de Callbacks d'Événements** 
**Problème :** Communication entre GameManager et GameScene pour événements de jeu
**Solution :** Pattern Observer avec callbacks
```typescript
// GameManager
private onTackleCallback: (() => void) | null = null;
private onTryScoreCallback: (() => void) | null = null;

// Enregistrement
public setOnTackleCallback(callback: () => void): void
public setOnTryScoreCallback(callback: () => void): void

// Déclenchement 
if (this.onTackleCallback) this.onTackleCallback();
```

### 2. **Mouvement Progressif Anti-Bug**
**Problème :** Clics rapides sur "Exécuter" faisaient rater les collisions
**Solution :** Division mouvement en étapes avec vérification continue
```typescript
// Ancien : movePlayer instantané + resolveContacts à la fin
// Nouveau : movePlayer par steps + resolveContacts à chaque step
for (let i = 0; i < steps; i++) {
  // Position step by step
  this.resolveContacts(); // ← À chaque étape !
  if (plaqué) return; // ← Arrêt immédiat
}
```

### 3. **Système d'Arrêt Post-Plaquage**
**Problème :** Joueur plaqué continuait d'avancer automatiquement
**Solution :** Set des joueurs plaqués + vérification avant mouvement automatique
```typescript
private tackedPlayers: Set<number> = new Set();

// Dans executeAttackMovements()
if (!instruction && !this.tackedPlayers.has(id)) {
  // Mouvement automatique SEULEMENT si pas plaqué
}
```

### 4. **Interface Flèche Pivotante 360°**
**Problème :** 8 boutons directionnels encombrants
**Solution :** Bouton unique + flèche qui suit la souris
```typescript
// État : isArrowActive
// 1er clic → déplier flèche
// Mouvement souris → rotation flèche
// 2ème clic → confirmer direction
// Résultat : contrôle précis 360° avec 2 clics
```

### 5. **Vitesse 0 sur Contact**
**Problème :** Distinction ballon vs joueur lors plaquage
**Solution :** Mettre vitesse joueur à 0 ET arrêter mouvement automatique
```typescript
ballCarrier.stats.vitesse = 0; // Joueur immobile
this.tackedPlayers.add(ballCarrierId); // Plus de mouvement auto
this.ballCarrierId = null; // Ballon libre
```

## 🎯 **Zones d'Attention pour Future IA**

### ⚠️ **Complex State Management**
L'état est distribué entre :
- `GameManager` : Vérité du jeu (positions, stats)
- `GameScene` : État UI (sélection, menus)
- `tackedPlayers` : État persistant entre tours
- Event listeners : État temporaire (flèche active)

### 🔄 **Callback Chain**
```
User Click → Scene Event → Manager Logic → Manager Callback → Scene Reaction → Restart
```

### 🎮 **UI State Cleanup**
TOUJOURS nettoyer :
```typescript
this.clearActionMenu(); // Event listeners
this.clearSelection(); // État sélection
this.scene.restart(); // Reset complet
```

---

**📝 Note :** Ces patterns ont été développés pour résoudre des bugs spécifiques. Une future IA doit les comprendre avant modification pour éviter régression.