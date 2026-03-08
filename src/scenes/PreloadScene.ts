import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('[PreloadScene] Fichier introuvable :', file.src);
    });

    this.load.spritesheet('player', 'assets/sprites/player_run.png', {
      frameWidth: 1024,
      frameHeight: 1536,
    });

    this.load.spritesheet('defense', 'assets/sprites/defense_run.png', {
      frameWidth: 192,
      frameHeight: 256,
    });
  }

  create(): void {
    // Supprimer le fond blanc des spritesheets
    this.removeWhiteBackground('player');
    this.removeWhiteBackground('defense');

    const texture = this.textures.get('player');
    const frameCount = texture.frameTotal - 1; // -1 pour exclure le frame "__BASE"

    if (frameCount >= 2) {
      this.anims.create({
        key: 'player_run',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1,
      });
    } else {
      console.warn('[PreloadScene] Spritesheet "player" non chargée — vérifier assets/sprites/player_run.png');
    }

    this.anims.create({
      key: 'defense_run',
      frames: this.anims.generateFrameNumbers('defense', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.start('MenuScene');
  }

  private removeWhiteBackground(key: string): void {
    const texture = this.textures.get(key);
    const source = texture.source[0] as any;
    const img = source.image as HTMLImageElement;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    source.image = canvas;
    source.isCanvas = true;
    source.init(this.sys.game);
  }
}
