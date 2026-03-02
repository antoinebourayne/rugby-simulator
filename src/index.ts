import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { LevelSelectionScene } from './scenes/LevelSelectionScene';
import { LevelEditorScene } from './scenes/LevelEditorScene';

/**
 * Configuration principale du jeu Rugby Simulator
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#2d4a2b',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [MenuScene, LevelSelectionScene, GameScene, LevelEditorScene]
};

/**
 * Point d'entrée principal de l'application
 */
class RugbySimulator {
  private game: Phaser.Game;

  constructor() {
    this.game = new Phaser.Game(config);
  }

  /**
   * Détruit l'instance du jeu
   */
  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}

// Initialisation du jeu au chargement de la page
window.addEventListener('load', () => {
  new RugbySimulator();
});

export { RugbySimulator };