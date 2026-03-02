import Phaser from 'phaser';

/**
 * Scène de sélection de niveau
 */
export class LevelSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectionScene' });
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Titre
        this.add.text(width / 2, height / 4, 'Sélection du niveau', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Niveau 1
        const level1Button = this.add.text(width / 2, height / 2 - 50, 'Niveau 1 — 2v1', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#3366cc',
            padding: { x: 20, y: 10 },
            fontFamily: 'Courier New'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene', { levelId: 'level_1' });
            })
            .on('pointerover', () => {
                level1Button.setStyle({ backgroundColor: '#4477dd' });
            })
            .on('pointerout', () => {
                level1Button.setStyle({ backgroundColor: '#3366cc' });
            });

        // Bouton retour
        const backButton = this.add.text(width / 2, height - 100, 'Retour', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 15, y: 8 },
            fontFamily: 'Courier New'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            })
            .on('pointerover', () => {
                backButton.setStyle({ backgroundColor: '#777777' });
            })
            .on('pointerout', () => {
                backButton.setStyle({ backgroundColor: '#666666' });
            });
    }
}
