import Phaser from 'phaser';
import { Position, Team, PlayerData } from '@/types';

/**
 * Représentation visuelle d'un joueur de rugby.
 *
 * En mode live le déplacement est piloté chaque frame par GameScene
 * qui appelle directement setPosition() — plus besoin de tweens.
 */
export class Player extends Phaser.GameObjects.Rectangle {
  private playerData: PlayerData;
  private isSelected: boolean = false;
  private originalColor: number;

  constructor(scene: Phaser.Scene, data: PlayerData) {
    const color = data.team === Team.ATTACK ? 0x3366cc : 0xcc3366;
    super(scene, data.position.x, data.position.y, 20, 30, color);

    this.playerData = { ...data };
    this.originalColor = color;

    this.setInteractive();
    this.setupEvents();

    scene.add.existing(this);
  }

  // ---- Événements souris ----

  private setupEvents(): void {
    this.on('pointerdown', this.onPlayerClick, this);
    this.on('pointerover', this.onPlayerHover, this);
    this.on('pointerout', this.onPlayerOut, this);
  }

  private onPlayerClick(): void {
    if (this.playerData.team === Team.ATTACK) {
      this.scene.events.emit('playerSelected', this.playerData.id);
    }
  }

  private onPlayerHover(): void {
    this.setFillStyle(0xffffff);
  }

  private onPlayerOut(): void {
    if (!this.isSelected) {
      this.setFillStyle(this.originalColor);
    }
  }

  // ---- API publique ----

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.setFillStyle(selected ? 0xffff00 : this.originalColor);
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

  public setBall(hasBall: boolean): void {
    this.playerData.hasBall = hasBall;
    if (hasBall) {
      this.setStrokeStyle(3, 0xffaa00);
    } else {
      this.setStrokeStyle(0);
    }
  }

  public getPosition(): Position {
    return { x: this.x, y: this.y };
  }

  public distanceTo(position: Position): number {
    const dx = this.x - position.x;
    const dy = this.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}