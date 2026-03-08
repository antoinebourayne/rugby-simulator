import Phaser from 'phaser';
import { LevelStore } from '@/game/state/LevelStore';
import { LevelData, PlayerData, Team } from '@/types';

// ─── Constantes terrain ──────────────────────────────────────────────────────
const FIELD_LEFT = 100;
const FIELD_TOP = 100;
const FIELD_RIGHT = 1100;
const FIELD_BOTTOM = 750;

const PANEL_CX = 1150;

/**
 * Scène d'édition de niveaux.
 *
 * - Bouton "+" bleu  → ajoute un attaquant au centre du terrain
 * - Bouton "+" rouge → ajoute un défenseur au centre du terrain
 * - Chaque joueur ajouté est draggable sur tout le terrain
 * - Bouton "Enregistrer" en bas à droite → prompt pour le nom puis sauvegarde
 */
export class LevelEditorScene extends Phaser.Scene {
  private editorPlayers: Phaser.GameObjects.Rectangle[] = [];
  private playerDataMap: Map<Phaser.GameObjects.Rectangle, PlayerData> = new Map();
  private nextPlayerId: number = 1;
  private isDragging: boolean = false;

  constructor() {
    super({ key: 'LevelEditorScene' });
  }

  // =====================================================================
  //  LIFECYCLE
  // =====================================================================

  create(): void {
    this.drawField();
    this.createSidePanel();
    this.createSaveButton();
    this.createBackButton();
    this.setupDrag();
  }

  // =====================================================================
  //  TERRAIN
  // =====================================================================

  private drawField(): void {
    const g = this.add.graphics();

    g.fillStyle(0x2d4a2b);
    g.fillRect(FIELD_LEFT, FIELD_TOP, FIELD_RIGHT - FIELD_LEFT, FIELD_BOTTOM - FIELD_TOP);

    g.fillStyle(0x3d5a3b);
    g.fillRect(FIELD_LEFT, FIELD_TOP - 50, FIELD_RIGHT - FIELD_LEFT, 50);

    g.lineStyle(2, 0xffffff, 1);
    g.strokeRect(FIELD_LEFT, FIELD_TOP, FIELD_RIGHT - FIELD_LEFT, FIELD_BOTTOM - FIELD_TOP);

    const midY = (FIELD_TOP + FIELD_BOTTOM) / 2;
    g.beginPath();
    g.moveTo(FIELD_LEFT, midY);
    g.lineTo(FIELD_RIGHT, midY);
    g.strokePath();

    const quarter = (FIELD_BOTTOM - FIELD_TOP) / 4;
    g.beginPath();
    g.moveTo(FIELD_LEFT, FIELD_TOP + quarter);
    g.lineTo(FIELD_RIGHT, FIELD_TOP + quarter);
    g.moveTo(FIELD_LEFT, FIELD_BOTTOM - quarter);
    g.lineTo(FIELD_RIGHT, FIELD_BOTTOM - quarter);
    g.strokePath();

    this.add.text(FIELD_LEFT, FIELD_TOP - 85, 'Editeur de Niveaux', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    });

    this.add.text(FIELD_LEFT + 10, FIELD_TOP - 45, 'EN-BUT', {
      fontSize: '12px',
      color: '#aaffaa',
      fontFamily: 'Courier New',
    });
  }

  // =====================================================================
  //  PANNEAU DROIT
  // =====================================================================

  private createSidePanel(): void {
    this.add.text(PANEL_CX, FIELD_TOP + 10, 'Ajouter', {
      fontSize: '13px',
      color: '#cccccc',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.createAddButton(PANEL_CX, FIELD_TOP + 80, 0x3366cc, 0x5588ee, Team.ATTACK);

    this.add.text(PANEL_CX, FIELD_TOP + 115, 'Attaque', {
      fontSize: '11px',
      color: '#88aaff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.createAddButton(PANEL_CX, FIELD_TOP + 175, 0xcc3333, 0xee5555, Team.DEFENSE);

    this.add.text(PANEL_CX, FIELD_TOP + 210, 'Defense', {
      fontSize: '11px',
      color: '#ff8888',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);
  }

  private createAddButton(
    x: number,
    y: number,
    colorNormal: number,
    colorHover: number,
    team: Team
  ): void {
    const btn = this.add.circle(x, y, 26, colorNormal)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive();

    const label = this.add.text(x, y, '+', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5, 0.5);

    btn.on('pointerover', () => btn.setFillStyle(colorHover));
    btn.on('pointerout', () => btn.setFillStyle(colorNormal));
    btn.on('pointerdown', () => {
      this.tweens.add({
        targets: [btn, label],
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 80,
        yoyo: true,
        onComplete: () => this.addPlayer(team),
      });
    });
  }

  // =====================================================================
  //  AJOUT DE JOUEURS
  // =====================================================================

  private addPlayer(team: Team): void {
    const cx = (FIELD_LEFT + FIELD_RIGHT) / 2;
    const cy = (FIELD_TOP + FIELD_BOTTOM) / 2;
    const color = team === Team.ATTACK ? 0x3366cc : 0xcc3333;

    const rect = this.add.rectangle(cx, cy, 20, 30, color)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive();

    this.input.setDraggable(rect);

    rect.on('pointerover', () => {
      if (!this.isDragging) rect.setStrokeStyle(3, 0xffff00);
    });
    rect.on('pointerout', () => rect.setStrokeStyle(2, 0xffffff));

    const data: PlayerData = {
      id: this.nextPlayerId++,
      team,
      position: { x: cx, y: cy },
      stats: { force: 80, vitesse: 80 },
      hasBall: false,
    };

    this.playerDataMap.set(rect, data);
    this.editorPlayers.push(rect);
  }

  // =====================================================================
  //  DRAG & DROP
  // =====================================================================

  private setupDrag(): void {
    this.input.on(
      'dragstart',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle) => {
        this.isDragging = true;
        gameObject.setStrokeStyle(3, 0xffff00);
        this.children.bringToTop(gameObject);
      }
    );

    this.input.on(
      'drag',
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Rectangle,
        dragX: number,
        dragY: number
      ) => {
        const x = Phaser.Math.Clamp(dragX, FIELD_LEFT + 12, FIELD_RIGHT - 12);
        const y = Phaser.Math.Clamp(dragY, FIELD_TOP + 17, FIELD_BOTTOM - 17);
        gameObject.setPosition(x, y);

        const data = this.playerDataMap.get(gameObject);
        if (data) data.position = { x, y };
      }
    );

    this.input.on(
      'dragend',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle) => {
        this.isDragging = false;
        gameObject.setStrokeStyle(2, 0xffffff);
      }
    );
  }

  // =====================================================================
  //  BOUTON ENREGISTRER
  // =====================================================================

  private createSaveButton(): void {
    const btn = this.add.text(1190, 770, 'Enregistrer', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#226622',
      padding: { x: 14, y: 8 },
      fontFamily: 'Courier New',
    })
      .setOrigin(1, 1)
      .setInteractive();

    btn.on('pointerover', () => btn.setBackgroundColor('#338833'));
    btn.on('pointerout', () => btn.setBackgroundColor('#226622'));
    btn.on('pointerdown', () => this.promptAndSave());
  }

  // =====================================================================
  //  BOUTON RETOUR
  // =====================================================================

  private createBackButton(): void {
    this.add.text(FIELD_LEFT, 770, 'Retour', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#663333',
      padding: { x: 14, y: 8 },
      fontFamily: 'Courier New',
    })
      .setOrigin(0, 1)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MenuScene'));
  }

  // =====================================================================
  //  SAUVEGARDE
  // =====================================================================

  private promptAndSave(): void {
    const name = window.prompt('Nom du niveau :', 'Mon niveau');
    if (name === null) return; // annulé

    const levelName = name.trim() || 'Niveau sans nom';
    this.saveLevel(levelName);
  }

  private saveLevel(name: string): void {
    const allData = this.editorPlayers.map(r => this.playerDataMap.get(r)!);
    const attackPlayers = allData.filter(d => d.team === Team.ATTACK);
    const defensePlayers = allData.filter(d => d.team === Team.DEFENSE);

    if (attackPlayers.length > 0) {
      attackPlayers[0].hasBall = true;
    }

    const cx = (FIELD_LEFT + FIELD_RIGHT) / 2;
    const cy = (FIELD_TOP + FIELD_BOTTOM) / 2;

    const level: LevelData = {
      id: `level_custom_${Date.now()}`,
      name,
      description: `${attackPlayers.length} attaquant(s) vs ${defensePlayers.length} defenseur(s)`,
      attackPlayers,
      defensePlayers,
      ballPosition:
        attackPlayers.length > 0 ? { ...attackPlayers[0].position } : { x: cx, y: cy },
      created: new Date(),
      modified: new Date(),
    };

    LevelStore.save(level);
    this.showSaveConfirmation(name);
  }

  private showSaveConfirmation(name: string): void {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    const overlay = this.add.rectangle(cx, cy, 380, 90, 0x000000, 0.88)
      .setStrokeStyle(2, 0x44cc44);
    const text = this.add.text(cx, cy, `"${name}" enregistre !`, {
      fontSize: '20px',
      color: '#44cc44',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.time.delayedCall(1800, () => {
      overlay.destroy();
      text.destroy();
    });
  }
}
