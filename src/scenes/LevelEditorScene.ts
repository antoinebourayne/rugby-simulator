import Phaser from 'phaser';

/**
 * Scène d'édition de niveaux
 */
export class LevelEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelEditorScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Titre
    this.add.text(width / 2, 50, 'Éditeur de Niveaux', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Message temporaire
    this.add.text(width / 2, height / 2, 
      'Éditeur de niveaux\n\n' +
      'Cette fonctionnalité sera implémentée\n' +
      'dans une prochaine version.\n\n' +
      'Vous pourrez ici :\n' +
      '- Placer les joueurs sur le terrain\n' +
      '- Définir leurs statistiques\n' +
      '- Sauvegarder vos scénarios\n' +
      '- Tester vos créations',
      {
        fontSize: '18px',
        color: '#cccccc',
        align: 'center',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    // Bouton retour
    this.add.text(width / 2, height - 100, 'Retour au Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#aa3333',
      padding: { x: 20, y: 10 },
      fontFamily: 'Courier New'
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}