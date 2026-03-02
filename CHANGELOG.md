# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### À venir
- Éditeur de niveaux complet
- Sprites animés pour les joueurs
- IA défensive avancée
- Actions de jeu supplémentaires (ruck, maul, crochets)
- Mode multijoueur

## [1.0.0] - 2026-02-20

### Ajouté
- **Core Gameplay**
  - Terrain de rugby 100m avec marquages officiels
  - Système de jeu tour par tour (Planification → Exécution → Résultat)
  - Équipes 5v5 (attaque contrôlée par le joueur, défense IA)
  - Actions de base : Courir, Passer, Taper au pied
  
- **Système de Joueurs**
  - Statistiques joueurs : Force et Vitesse
  - Système de plaquage probabiliste basé sur les stats
  - Sélection interactive des joueurs d'attaque
  - Indication visuelle du porteur de ballon

- **Intelligence Artificielle**
  - IA défensive basique : convergence vers le porteur de ballon
  - Déplacement intelligent selon les stats de vitesse
  - Formation défensive simple

- **Interface Utilisateur**
  - Menu principal avec navigation vers jeu et éditeur
  - Interface de jeu intuitive avec sélection par clic
  - Feedback visuel pour les ordres donnés
  - Instructions de jeu intégrées

- **Gestion des Niveaux**
  - Système de sauvegarde en localStorage
  - Niveau d'exemple pré-configuré
  - Structure pour éditeur de niveaux (interface placeholder)

- **Architecture Technique**
  - Stack : Phaser.js 3.70 + TypeScript 5.3 + Webpack 5
  - Architecture modulaire avec pattern Manager
  - Système d'entités séparé (données vs rendu)
  - Configuration ESLint stricte
  - Documentation complète

### Technique
- Configuration Webpack pour dev et production
- Hot reloading en développement
- Build optimisé pour déploiement
- Types TypeScript stricts
- Structure de projet évolutive

### Documentation
- README complet avec guide d'installation
- Documentation d'architecture technique
- Guide de développement pour contributors
- Conventions de code et workflow Git

## [0.1.0] - 2026-02-20

### Ajouté
- Initialisation du projet
- Structure de base du code
- Configuration des outils de développement