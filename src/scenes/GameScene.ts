import Phaser from 'phaser';
import { Player } from '@/game/entities/Player';
import { GameManager } from '@/game/managers/GameManager';
import { LevelManager } from '@/game/managers/LevelManager';
import { PlayerAction, GameState, FieldConfig } from '@/types';

// ─── Constantes terrain (pixels) ────────────────────────────────────
const FIELD_LEFT = 100;
const FIELD_TOP = 100;   // en-but attaque au-dessus
const FIELD_RIGHT = 1100;
const FIELD_BOTTOM = 750;
const TRY_LINE_Y = FIELD_TOP;  // franchir cette ligne = essai

const FIELD_CONFIG: FieldConfig = {
  bounds: { left: FIELD_LEFT, top: FIELD_TOP, right: FIELD_RIGHT, bottom: FIELD_BOTTOM },
  tryLineY: TRY_LINE_Y
};

/**
 * Scène principale du jeu — Mode Live
 *
 * Le jeu tourne en temps réel via update().
 * ESPACE met en pause pour donner des ordres (direction / passe) aux joueurs d'attaque.
 */
export class GameScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private levelManager!: LevelManager;
  private players: Map<number, Player> = new Map();

  // UI
  private fieldGraphics!: Phaser.GameObjects.Graphics;
  private ballSprite!: Phaser.GameObjects.Arc;
  private statusText!: Phaser.GameObjects.Text;

  // Sélection & menu d'ordres
  private selectedPlayerId: number | null = null;
  private orderMenuContainer: Phaser.GameObjects.Container | null = null;
  private skipNextPointerDown: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  // =====================================================================
  //  LIFECYCLE
  // =====================================================================

  create(data: any): void {
    this.gameManager = new GameManager(FIELD_CONFIG);
    this.levelManager = new LevelManager();
    this.levelManager.loadFromStorage();

    // Callbacks événements de jeu
    this.gameManager.setOnTryScoreCallback(() => this.handleTryScore());
    this.gameManager.setOnTackleCallback(() => this.handleTackle());
    this.gameManager.setOnInterceptionCallback(() => this.handleInterception());

    // Dessiner le terrain
    this.createField();

    // Charger le niveau sélectionné ou niveau 1 par défaut
    let level;
    const levelId = data?.levelId;

    if (levelId === 'level_1') {
      level = this.levelManager.createLevel1();
    } else {
      // Par défaut, charger le niveau 1
      level = this.levelManager.createLevel1();
    }

    this.gameManager.initializeLevel(level);

    // Créer les sprites joueurs + ballon
    this.createPlayers();
    this.createBall();

    // UI
    this.createUI();

    // Contrôles
    this.setupControls();
  }

  /**
   * Boucle de jeu appelée chaque frame par Phaser.
   * C'est ici que tout bouge en temps réel.
   */
  update(_time: number, delta: number): void {
    // Avancer la simulation
    this.gameManager.update(delta);

    // Synchroniser visuels ↔ données logiques
    this.syncVisuals();
  }

  // =====================================================================
  //  TERRAIN
  // =====================================================================

  private createField(): void {
    this.fieldGraphics = this.add.graphics();

    // Fond du terrain
    this.fieldGraphics.fillStyle(0x2d4a2b);
    this.fieldGraphics.fillRect(FIELD_LEFT, FIELD_TOP, FIELD_RIGHT - FIELD_LEFT, FIELD_BOTTOM - FIELD_TOP);

    // Contour
    this.fieldGraphics.lineStyle(2, 0xffffff);
    this.fieldGraphics.strokeRect(FIELD_LEFT, FIELD_TOP, FIELD_RIGHT - FIELD_LEFT, FIELD_BOTTOM - FIELD_TOP);

    // Ligne médiane
    const midY = (FIELD_TOP + FIELD_BOTTOM) / 2;
    this.fieldGraphics.moveTo(FIELD_LEFT, midY);
    this.fieldGraphics.lineTo(FIELD_RIGHT, midY);
    this.fieldGraphics.stroke();

    // Lignes des 22m (approximation visuelle)
    const quarter = (FIELD_BOTTOM - FIELD_TOP) / 4;
    this.fieldGraphics.moveTo(FIELD_LEFT, FIELD_TOP + quarter);
    this.fieldGraphics.lineTo(FIELD_RIGHT, FIELD_TOP + quarter);
    this.fieldGraphics.moveTo(FIELD_LEFT, FIELD_BOTTOM - quarter);
    this.fieldGraphics.lineTo(FIELD_RIGHT, FIELD_BOTTOM - quarter);
    this.fieldGraphics.stroke();

    // En-but (zone au-dessus de la ligne d'essai)
    this.fieldGraphics.fillStyle(0x3d5a3b);
    this.fieldGraphics.fillRect(FIELD_LEFT, FIELD_TOP - 50, FIELD_RIGHT - FIELD_LEFT, 50);
  }

  // =====================================================================
  //  JOUEURS & BALLON
  // =====================================================================

  private createPlayers(): void {
    this.gameManager.getAttackPlayers().forEach((data, id) => {
      this.players.set(id, new Player(this, data));
    });
    this.gameManager.getDefensePlayers().forEach((data, id) => {
      this.players.set(id, new Player(this, data));
    });
  }

  private createBall(): void {
    const pos = this.gameManager.getBallPosition();
    this.ballSprite = this.add.circle(pos.x, pos.y, 6, 0xffa500);
    this.ballSprite.setStrokeStyle(2, 0x000000);
  }

  /**
   * Synchronise toutes les positions visuelles avec les données logiques du GameManager.
   */
  private syncVisuals(): void {
    // Joueurs d'attaque
    this.gameManager.getAttackPlayers().forEach((data, id) => {
      const sprite = this.players.get(id);
      if (sprite) {
        sprite.setPosition(data.position.x, data.position.y);
        sprite.setBall(data.hasBall);
      }
    });

    // Joueurs de défense
    this.gameManager.getDefensePlayers().forEach((data, id) => {
      const sprite = this.players.get(id);
      if (sprite) {
        sprite.setPosition(data.position.x, data.position.y);
        sprite.setBall(data.hasBall);
      }
    });

    // Ballon
    const ballPos = this.gameManager.getBallPosition();
    this.ballSprite.setPosition(ballPos.x, ballPos.y);
  }

  // =====================================================================
  //  UI
  // =====================================================================

  private createUI(): void {
    this.statusText = this.add.text(FIELD_LEFT, FIELD_TOP - 80, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#4a4a4a',
      padding: { x: 10, y: 8 }
    });

    this.updateStatusText();

    // Bouton retour menu
    this.add.text(FIELD_RIGHT - 80, FIELD_TOP - 80, 'Menu', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#6a6a6a',
      padding: { x: 8, y: 4 }
    })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MenuScene'));

    // Aide
    this.add.text(FIELD_LEFT, FIELD_BOTTOM + 10, 'ESPACE = pause / reprendre  |  Cliquez un attaquant (bleu) en pause pour donner un ordre', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  private updateStatusText(): void {
    const state = this.gameManager.getState();
    if (state === GameState.PAUSED) {
      this.statusText.setText('⏸  EN PAUSE — Donnez vos ordres puis appuyez sur ESPACE');
      this.statusText.setBackgroundColor('#cc4444');
    } else if (state === GameState.RUNNING) {
      this.statusText.setText('▶  JEU EN COURS — ESPACE pour pause');
      this.statusText.setBackgroundColor('#44aa44');
    } else {
      this.statusText.setText('🏁  FIN DE PARTIE');
      this.statusText.setBackgroundColor('#4444aa');
    }
  }

  // =====================================================================
  //  CONTRÔLES
  // =====================================================================

  private setupControls(): void {
    // ESPACE : toggle pause / resume
    this.input.keyboard!.on('keydown-SPACE', () => {
      const state = this.gameManager.getState();
      if (state === GameState.RUNNING) {
        this.gameManager.pause();
        this.clearSelection();
        this.updateStatusText();
      } else if (state === GameState.PAUSED) {
        this.clearSelection();
        this.gameManager.resume();
        this.updateStatusText();
      }
    });

    // Clic sur un joueur d'attaque (seulement en pause)
    this.events.on('playerSelected', (playerId: number) => {
      if (this.gameManager.getState() !== GameState.PAUSED) return;
      this.selectPlayer(playerId);
    });
  }

  // =====================================================================
  //  SÉLECTION & MENU D'ORDRES
  // =====================================================================

  private selectPlayer(playerId: number): void {
    // Désélectionner l'ancien
    if (this.selectedPlayerId !== null) {
      this.players.get(this.selectedPlayerId)?.setSelected(false);
    }

    this.selectedPlayerId = playerId;
    this.players.get(playerId)?.setSelected(true);

    this.showOrderMenu();
  }

  private clearSelection(): void {
    if (this.selectedPlayerId !== null) {
      this.players.get(this.selectedPlayerId)?.setSelected(false);
      this.selectedPlayerId = null;
    }
    this.clearOrderMenu();
  }

  private clearOrderMenu(): void {
    if (this.orderMenuContainer) {
      this.orderMenuContainer.destroy();
      this.orderMenuContainer = null;
    }
    // Réinitialiser le flag de skip
    this.skipNextPointerDown = false;
    // Nettoyer les listeners
    this.input.off('pointermove', this.onArrowMove, this);
    this.input.off('pointerdown', this.onArrowConfirm, this);
  }

  // ---- variables partagées pour le menu flèche ----
  private arrowActive: 'run' | 'pass' | null = null;
  private arrowAngle: number = 0;
  private arrowCenterX: number = 0;
  private arrowCenterY: number = 0;
  private arrowHead!: Phaser.GameObjects.Triangle;

  /**
   * Affiche les boutons « direction » et « passe » à côté du joueur sélectionné.
   */
  private showOrderMenu(): void {
    this.clearOrderMenu();
    if (this.selectedPlayerId === null) return;

    const sprite = this.players.get(this.selectedPlayerId);
    if (!sprite) return;

    const px = sprite.x;
    const py = sprite.y;
    const hasBall = sprite.hasBall();

    this.orderMenuContainer = this.add.container(0, 0);

    // ---- Bouton « Direction » (toujours visible) ----
    const runBtn = this.add.circle(px + 50, py, 20, 0x4444aa, 0.85)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive();
    const runIcon = this.add.text(px + 50, py, '➜', { fontSize: '22px', color: '#fff' }).setOrigin(0.5);
    runBtn.on('pointerdown', () => this.activateArrow('run', px, py));

    this.orderMenuContainer.add([runBtn, runIcon]);

    // ---- Bouton « Passe » (seulement si porteur) ----
    if (hasBall) {
      const passBtn = this.add.circle(px + 50, py + 50, 20, 0xaa4444, 0.85)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive();
      const passIcon = this.add.text(px + 50, py + 50, '🤚', { fontSize: '22px', color: '#fff' }).setOrigin(0.5);
      passBtn.on('pointerdown', () => this.activateArrow('pass', px, py));

      this.orderMenuContainer.add([passBtn, passIcon]);
    }

    // ---- Flèche (pointe uniquement, cachée par défaut) ----
    this.arrowHead = this.add.triangle(0, 0, 0, -12, -8, 12, 8, 12, 0xffaa00).setAlpha(0);

    this.orderMenuContainer.add([this.arrowHead]);
  }

  private activateArrow(mode: 'run' | 'pass', cx: number, cy: number): void {
    this.arrowActive = mode;
    this.arrowCenterX = cx;
    this.arrowCenterY = cy;
    this.arrowHead.setAlpha(1);

    const color = mode === 'run' ? 0xffaa00 : 0xff4444;
    this.arrowHead.setFillStyle(color);

    // Ignorer le clic immédiat qui a déclenché l'activation
    this.skipNextPointerDown = true;

    this.input.on('pointermove', this.onArrowMove, this);
    this.input.on('pointerdown', this.onArrowConfirm, this);
  }

  private onArrowMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.arrowActive) return;

    const dist = 80;

    // Pour les passes, contraindre la direction vers le bas (Y positif)
    // Cela empêche mécaniquement les passes en avant
    if (this.arrowActive === 'pass') {
      const dy = pointer.y - this.arrowCenterY;

      // Si la souris est au-dessus du centre, la forcer vers le bas
      let adjustedY = pointer.y;
      if (dy < 0) {
        adjustedY = this.arrowCenterY; // Au minimum au même niveau
      }

      this.arrowAngle = Phaser.Math.Angle.Between(this.arrowCenterX, this.arrowCenterY, pointer.x, adjustedY);
    } else {
      // Pour la course, utiliser l'angle normal
      this.arrowAngle = Phaser.Math.Angle.Between(this.arrowCenterX, this.arrowCenterY, pointer.x, pointer.y);
    }

    const ex = this.arrowCenterX + Math.cos(this.arrowAngle) * dist;
    const ey = this.arrowCenterY + Math.sin(this.arrowAngle) * dist;

    this.arrowHead.setPosition(ex, ey);
    this.arrowHead.setRotation(this.arrowAngle + Math.PI / 2);
  };

  private onArrowConfirm = (pointer: Phaser.Input.Pointer): void => {
    if (!this.arrowActive || this.selectedPlayerId === null) return;

    // Ignorer le premier clic qui a déclenché l'activation de la flèche
    if (this.skipNextPointerDown) {
      this.skipNextPointerDown = false;
      return;
    }

    // Ignorer si on clique sur les boutons eux-mêmes
    const dFromCenter = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.arrowCenterX + 50, this.arrowCenterY
    );
    if (dFromCenter < 25) return;

    const dirX = Math.cos(this.arrowAngle);
    const dirY = Math.sin(this.arrowAngle);

    if (this.arrowActive === 'run') {
      this.gameManager.setOrder(this.selectedPlayerId, {
        action: PlayerAction.RUN,
        direction: { x: dirX, y: dirY }
      });
    } else {
      this.gameManager.setOrder(this.selectedPlayerId, {
        action: PlayerAction.PASS,
        direction: { x: dirX, y: dirY }
      });
    }

    this.clearSelection();
  };

  // =====================================================================
  //  ÉVÉNEMENTS DE JEU (essai, interception)
  // =====================================================================

  private handleInterception(): void {
    const ballPos = this.gameManager.getBallPosition();
    const fx = this.add.circle(ballPos.x, ballPos.y, 40, 0xffaa00, 0.6);
    const txt = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'INTERCEPTION', {
      fontSize: '48px', color: '#ffaa00', align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({ targets: fx, scaleX: 2, scaleY: 2, alpha: 0, duration: 1000, onComplete: () => fx.destroy() });
    this.time.delayedCall(2000, () => { txt.destroy(); this.restartLevel(); });
  }

  private handleTackle(): void {
    const ballPos = this.gameManager.getBallPosition();
    const fx = this.add.circle(ballPos.x, ballPos.y, 40, 0xff6600, 0.6);
    const txt = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'PLAQUAGE', {
      fontSize: '48px', color: '#ff6600', align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({ targets: fx, scaleX: 2, scaleY: 2, alpha: 0, duration: 1000, onComplete: () => fx.destroy() });
    this.time.delayedCall(2000, () => { txt.destroy(); this.restartLevel(); });
  }

  private handleTryScore(): void {
    const ballPos = this.gameManager.getBallPosition();
    const fx = this.add.circle(ballPos.x, ballPos.y, 50, 0x00ff00, 0.7);
    this.tweens.add({ targets: fx, scaleX: 3, scaleY: 3, alpha: 0, duration: 2000, onComplete: () => fx.destroy() });

    const txt = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'ESSAI !', {
      fontSize: '48px', color: '#ffff00', backgroundColor: '#000', padding: { x: 20, y: 10 }, align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => { txt.destroy(); this.restartLevel(); });
  }

  // =====================================================================
  //  RESTART
  // =====================================================================

  private restartLevel(): void {
    this.clearSelection();

    // Détruire les anciens sprites joueurs
    this.players.forEach(p => p.destroy());
    this.players.clear();

    // Détruire l'ancien ballon
    if (this.ballSprite) {
      this.ballSprite.destroy();
    }

    const level = this.levelManager.createExampleLevel();
    this.gameManager.initializeLevel(level);

    this.createPlayers();
    this.createBall();

    this.updateStatusText();
  }
}