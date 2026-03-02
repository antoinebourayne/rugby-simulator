import Phaser from 'phaser';

/**
 * Scène de menu principal
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Titre du jeu
    this.add.text(width / 2, height / 4, 'Rugby Simulator', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Menu principal
    const playButton = this.add.text(width / 2, height / 2 - 50, 'Jouer', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#3366cc',
      padding: { x: 20, y: 10 },
      fontFamily: 'Courier New'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('LevelSelectionScene');
      })
      .on('pointerover', () => {
        playButton.setStyle({ backgroundColor: '#4477dd' });
      })
      .on('pointerout', () => {
        playButton.setStyle({ backgroundColor: '#3366cc' });
      });

    const editorButton = this.add.text(width / 2, height / 2 + 10, 'Éditeur de niveaux', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#cc6633',
      padding: { x: 20, y: 10 },
      fontFamily: 'Courier New'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('LevelEditorScene');
      })
      .on('pointerover', () => {
        editorButton.setStyle({ backgroundColor: '#dd7744' });
      })
      .on('pointerout', () => {
        editorButton.setStyle({ backgroundColor: '#cc6633' });
      });

    // Instructions
    this.add.text(width / 2, height - 100,
      'Un simulateur de rugby tactique en temps réel\n' +
      'ESPACE pour pause — donnez vos ordres — ESPACE pour reprendre !',
      {
        fontSize: '16px',
        color: '#cccccc',
        align: 'center',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);
  }
}