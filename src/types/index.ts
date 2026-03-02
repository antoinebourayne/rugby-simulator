/**
 * Types et interfaces pour le simulateur de rugby — Mode Live
 */

/**
 * Position sur le terrain (en pixels)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Vecteur de direction normalisé
 */
export interface Direction {
  x: number;
  y: number;
}

/**
 * Statistiques d'un joueur
 */
export interface PlayerStats {
  force: number;    // Force physique (0-100)
  vitesse: number;  // Vitesse de course (0-100)
}

/**
 * Actions possibles pour un joueur
 */
export enum PlayerAction {
  RUN = 'run',            // Courir dans une direction
  PASS = 'pass',          // Passer le ballon dans une direction
}

/**
 * Ordre donné à un joueur pendant la pause
 */
export interface PlayerOrder {
  action: PlayerAction;
  direction: Direction;   // Direction normalisée de course ou de passe
}

/**
 * Équipe (attaque ou défense)
 */
export enum Team {
  ATTACK = 'attack',
  DEFENSE = 'defense'
}

/**
 * État du jeu — Mode Live
 */
export enum GameState {
  PAUSED = 'paused',       // Jeu en pause — l'utilisateur donne des ordres
  RUNNING = 'running',     // Jeu en cours — les joueurs bougent en temps réel
  GAME_OVER = 'game_over'  // Fin de partie (essai ou plaquage)
}

/**
 * Données d'un niveau/scénario
 */
export interface LevelData {
  id: string;
  name: string;
  description: string;
  attackPlayers: PlayerData[];
  defensePlayers: PlayerData[];
  ballPosition: Position;
  created: Date;
  modified: Date;
}

/**
 * Données d'un joueur
 */
export interface PlayerData {
  id: number;
  team: Team;
  position: Position;
  stats: PlayerStats;
  hasBall: boolean;
}

/**
 * Configuration du terrain (en pixels)
 */
export interface FieldConfig {
  /** Limites de la zone jouable */
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  /** Position Y de la ligne d'en-but attaque (haut) */
  tryLineY: number;
}