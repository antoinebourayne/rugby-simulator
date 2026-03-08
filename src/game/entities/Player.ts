import Phaser from 'phaser';
import { Position, Team, PlayerData } from '@/types';

// Taille du sprite d'attaque (largeur affichée en pixels)
const ATTACK_DISPLAY_WIDTH = 55;
const SPRITE_FRAME_WIDTH = 1024;
const ATTACK_SCALE = ATTACK_DISPLAY_WIDTH / SPRITE_FRAME_WIDTH;

// Taille du sprite de défense (largeur affichée en pixels)
const DEFENSE_DISPLAY_WIDTH = 40;
const DEFENSE_FRAME_WIDTH = 192;
const DEFENSE_SCALE = DEFENSE_DISPLAY_WIDTH / DEFENSE_FRAME_WIDTH;

export class Player extends Phaser.GameObjects.Sprite {
  private playerData: PlayerData;
  private isSelected: boolean = false;
  private isAttack: boolean;
  private ballTriangle: Phaser.GameObjects.Triangle;

  constructor(scene: Phaser.Scene, data: PlayerData) {
    const isAttack = data.team === Team.ATTACK;

    super(scene, data.position.x, data.position.y, isAttack ? 'player' : 'defense', 0);

    this.playerData = { ...data };
    this.isAttack = isAttack;

    if (isAttack) {
      this.setScale(ATTACK_SCALE);
      const runAnim = scene.anims.get('player_run');
      if (runAnim && runAnim.frames.length > 0) {
        this.play('player_run');
      }
    } else {
      this.setScale(DEFENSE_SCALE);
      const defAnim = scene.anims.get('defense_run');
      if (defAnim && defAnim.frames.length > 0) {
        this.play('defense_run');
      }
    }

    // Les joueurs sont au-dessus du ballon (depth 2)
    this.setDepth(2);

    // Triangle blanc au-dessus de la tête pour indiquer le porteur du ballon
    const headOffset = isAttack ? 53 : 35;
    this.ballTriangle = scene.add.triangle(
      data.position.x, data.position.y - headOffset,
      0, 8, -7, -6, 7, -6,
      0xffffff
    );
    this.ballTriangle.setDepth(3);
    this.ballTriangle.setVisible(false);

    this.setInteractive();
    this.setupEvents();
    scene.add.existing(this);
  }

  private setupEvents(): void {
    this.on('pointerover', () => this.setTint(0xffffff));
    this.on('pointerout', () => {
      if (this.isSelected) return;
      this.clearTint();
    });
    this.on('pointerdown', () => {
      if (this.isAttack) {
        this.scene.events.emit('playerSelected', this.playerData.id);
      }
    });
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    if (selected) {
      this.setTint(0xffff00);
    } else {
      this.clearTint();
    }
  }

  public updateMovement(isMoving: boolean): void {
    const animKey = this.isAttack ? 'player_run' : 'defense_run';
    if (isMoving) {
      if (!this.anims.isPlaying) {
        this.play(animKey);
      }
    } else {
      if (this.anims.isPlaying) {
        this.anims.stop();
        this.setFrame(0);
      }
    }
  }

  public setBall(hasBall: boolean): void {
    this.playerData.hasBall = hasBall;
    this.ballTriangle.setVisible(hasBall);
  }

  public updateData(data: Partial<PlayerData>): void {
    this.playerData = { ...this.playerData, ...data };
  }

  public getData(): PlayerData {
    return { ...this.playerData };
  }

  public getId(): number {
    return this.playerData.id;
  }

  public hasBall(): boolean {
    return this.playerData.hasBall;
  }

  public setPosition(x: number, y: number): this {
    super.setPosition(x, y);
    if (this.ballTriangle) {
      const headOffset = this.isAttack ? 53 : 35;
      this.ballTriangle.setPosition(x, y - headOffset);
    }
    return this;
  }

  public getPosition(): Position {
    return { x: this.x, y: this.y };
  }

  public distanceTo(position: Position): number {
    const dx = this.x - position.x;
    const dy = this.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public destroy(fromScene?: boolean): void {
    this.ballTriangle?.destroy();
    super.destroy(fromScene);
  }
}
