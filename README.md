# Rugby Simulator 🏉

Un simulateur de rugby tactique en 2D développé avec Phaser.js et TypeScript. Dirigez votre équipe d'attaque pour percer la défense adverse dans ce jeu de stratégie au tour par tour.

## 🎯 Objectifs du Jeu

- **Objectif principal** : Marquer un essai en atteignant la ligne d'en-but adverse
- **Gameplay** : Tour par tour tactique avec planification des mouvements
- **Contrôle** : Vous dirigez l'équipe d'attaque (5 joueurs) contre une IA défensive
- **Actions** : Courir, passer, taper au pied

## 🚀 Fonctionnalités

### Version Actuelle (v1.0)
- ✅ Terrain de rugby 100m avec marquages
- ✅ Équipes 5v5 (attaque contrôlée, défense IA)
- ✅ Système de tours : Planification → Exécution → Résultat
- ✅ Actions de base : Courir, Passer, Taper au pied
- ✅ Statistiques joueurs (Force, Vitesse)
- ✅ Système de plaquage basé sur les stats
- ✅ Interface simple et intuitive
- ✅ Sauvegarde de niveaux en local

### Fonctionnalités Futures
- 🔄 Éditeur de niveaux complet
- 🔄 Sprites de joueurs animés
- 🔄 IA défensive avancée
- 🔄 Actions avancées (ruck, maul, crochets)
- 🔄 Mode multijoueur en ligne
- 🔄 Système de campagne
- 🔄 Sons et effets visuels

## 🎮 Comment Jouer

1. **Sélection** : Cliquez sur un joueur d'attaque (bleu) pour le sélectionner
2. **Mouvement** : Cliquez sur le terrain pour lui dire où aller
3. **Actions spéciales** : Utilisez le clavier pour d'autres actions (à venir)
4. **Exécution** : Cliquez sur "Exécuter" pour voir tous les mouvements se dérouler
5. **Victoire** : Amenez le porteur de ballon dans l'en-but adverse !

## 🛠️ Installation et Développement

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd rugby-simulator

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour la production
npm run build
```

### Scripts Disponibles
- `npm run dev` : Serveur de développement avec rechargement automatique
- `npm run build` : Construction pour la production
- `npm run build:dev` : Construction de développement
- `npm run clean` : Nettoyage du dossier dist
- `npm run lint` : Vérification du code avec ESLint
- `npm run type-check` : Vérification des types TypeScript

## 📁 Structure du Projet

```
rugby-simulator/
├── src/
│   ├── game/                 # Logique de jeu
│   │   ├── entities/         # Entités du jeu (Player, Ball, etc.)
│   │   └── managers/         # Gestionnaires (GameManager, LevelManager)
│   ├── scenes/               # Scènes Phaser.js
│   │   ├── MenuScene.ts      # Menu principal
│   │   ├── GameScene.ts      # Jeu principal
│   │   └── LevelEditorScene.ts # Éditeur de niveaux
│   ├── types/                # Définitions TypeScript
│   ├── utils/                # Utilitaires
│   ├── index.html           # Page HTML principale
│   └── index.ts             # Point d'entrée
├── dist/                    # Build de production
├── docs/                    # Documentation
└── config files             # Configuration TypeScript/Webpack
```

## 🏗️ Architecture Technique

### Technologies Utilisées
- **Phaser.js 3.70** : Engine de jeu 2D
- **TypeScript 5.3** : Langage avec typage statique
- **Webpack 5** : Bundler et serveur de développement
- **ESLint** : Linter pour la qualité du code

### Patterns de Conception
- **Manager Pattern** : GameManager, LevelManager pour la logique métier
- **Entity-Component** : Player comme entité visuelle et data
- **Scene Pattern** : Séparation des écrans (Menu, Jeu, Éditeur)
- **Event-Driven** : Communication entre composants via événements

## 🎨 Style et Assets

- **Style visuel** : Pixel art rétro avec palette verte (terrain)
- **Interface** : Police Courier New pour un look rétro
- **Couleurs** :
  - Terrain : #2d4a2b (vert foncé)
  - Attaque : #3366cc (bleu)
  - Défense : #cc3366 (rouge)
  - Ballon : #ffaa00 (orange)

## 🧪 Tests et Débogage

- Interface de débogage disponible en mode développement
- Logs détaillés dans la console du navigateur
- Niveau d'exemple intégré pour les tests

## 📈 Roadmap

### Phase 1 : Core Gameplay ✅
- [x] Système de jeu de base fonctionnel
- [x] Interface utilisateur basique
- [x] IA défensive simple

### Phase 2 : Content & Polish 🔄
- [ ] Éditeur de niveaux complet
- [ ] Sprites animés pour les joueurs
- [ ] Effets sonores et visuels
- [ ] Tutoriel intégré

### Phase 3 : Advanced Features 🔄
- [ ] IA défensive avancée
- [ ] Actions de jeu complexes
- [ ] Mode campagne
- [ ] Multijoueur

### Phase 4 : Distribution 🔄
- [ ] Optimisation performances
- [ ] Déploiement en ligne
- [ ] Mobile responsive
- [ ] PWA capabilities

## 🤝 Contribution

Le projet est ouvert aux contributions ! Voici comment vous pouvez aider :

1. **Code** : Nouvelles fonctionnalités, corrections de bugs
2. **Art** : Sprites, animations, assets visuels
3. **Game Design** : Équilibrage, nouveaux modes de jeu
4. **Documentation** : Amélioration de la doc, tutoriels

### Guidelines de Développement
- Utiliser TypeScript strict
- Suivre les conventions ESLint
- Commenter les fonctions publiques
- Tester les nouvelles fonctionnalités

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👥 Auteurs

- **Antoine Bourayne** - Développement principal
- Contributeurs bienvenus !

---

*Créé avec ❤️ pour les amateurs de rugby et de jeux de stratégie*