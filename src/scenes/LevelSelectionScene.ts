import Phaser from 'phaser';
import { LevelStore } from '@/game/state/LevelStore';
import { LevelData } from '@/types';

const SCROLL_AREA_TOP = 130;
const SCROLL_AREA_BOTTOM = 720;
const SCROLL_AREA_HEIGHT = SCROLL_AREA_BOTTOM - SCROLL_AREA_TOP;
const ITEM_HEIGHT = 70;
const BTN_WIDTH = 560;

/**
 * Scène de sélection de niveau.
 *
 * Affiche tous les niveaux (built-in + personnalisés) dans une liste
 * scrollable à la molette.
 */
export class LevelSelectionScene extends Phaser.Scene {
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollOffset: number = 0;
  private totalContentHeight: number = 0;

  constructor() {
    super({ key: 'LevelSelectionScene' });
  }

  // =====================================================================
  //  LIFECYCLE
  // =====================================================================

  create(): void {
    const { width } = this.cameras.main;

    // ── Fond ─────────────────────────────────────────────────────────────
    this.add.rectangle(width / 2, 400, width, 800, 0x1a1a2e);

    // ── Titre ─────────────────────────────────────────────────────────────
    this.add.text(width / 2, 65, 'Choisir un niveau', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // ── Séparateur ────────────────────────────────────────────────────────
    const sepGfx = this.add.graphics();
    sepGfx.lineStyle(1, 0x444466, 1);
    sepGfx.beginPath();
    sepGfx.moveTo(80, SCROLL_AREA_TOP - 10);
    sepGfx.lineTo(width - 80, SCROLL_AREA_TOP - 10);
    sepGfx.strokePath();
    sepGfx.beginPath();
    sepGfx.moveTo(80, SCROLL_AREA_BOTTOM + 10);
    sepGfx.lineTo(width - 80, SCROLL_AREA_BOTTOM + 10);
    sepGfx.strokePath();

    // ── Liste scrollable ──────────────────────────────────────────────────
    const levels = LevelStore.getAll();
    this.createScrollableList(levels, width);

    // ── Indicateur scroll (si besoin) ─────────────────────────────────────
    if (levels.length > Math.floor(SCROLL_AREA_HEIGHT / ITEM_HEIGHT)) {
      this.add.text(width / 2, SCROLL_AREA_BOTTOM + 18, '▼ molette pour défiler', {
        fontSize: '13px',
        color: '#666688',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);
    }

    // ── Bouton retour ─────────────────────────────────────────────────────
    this.createBackButton(width);
  }

  // =====================================================================
  //  LISTE SCROLLABLE
  // =====================================================================

  private createScrollableList(levels: LevelData[], width: number): void {
    const cx = width / 2;

    // Container dont on déplace l'Y pour scroller
    // Les enfants sont positionnés relativement à ce container
    this.scrollContainer = this.add.container(0, SCROLL_AREA_TOP);

    levels.forEach((level, i) => {
      const itemY = i * ITEM_HEIGHT + ITEM_HEIGHT / 2;

      const isBuiltIn = !level.id.startsWith('level_custom');
      const btnColor = isBuiltIn ? 0x1a3a6a : 0x3a1a6a;
      const btnHover = isBuiltIn ? 0x2a4a8a : 0x4a2a8a;

      const btn = this.add.rectangle(cx, itemY, BTN_WIDTH, 54, btnColor)
        .setStrokeStyle(2, isBuiltIn ? 0x4488cc : 0x8844cc)
        .setInteractive();

      const nameText = this.add.text(cx, itemY - 8, level.name, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Courier New',
      }).setOrigin(0.5, 0.5);

      const descText = this.add.text(cx, itemY + 14, level.description, {
        fontSize: '13px',
        color: '#aaaacc',
        fontFamily: 'Courier New',
      }).setOrigin(0.5, 0.5);

      btn.on('pointerover', () => btn.setFillStyle(btnHover));
      btn.on('pointerout', () => btn.setFillStyle(btnColor));
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { levelId: level.id });
      });

      this.scrollContainer.add([btn, nameText, descText]);
    });

    this.totalContentHeight = levels.length * ITEM_HEIGHT;

    // ── Masque pour clipper la zone de scroll ─────────────────────────────
    const maskGfx = this.add.graphics();
    maskGfx.fillRect(0, SCROLL_AREA_TOP, width, SCROLL_AREA_HEIGHT);
    this.scrollContainer.setMask(maskGfx.createGeometryMask());

    // ── Molette ───────────────────────────────────────────────────────────
    this.input.on(
      'wheel',
      (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _dx: number, deltaY: number) => {
        const maxScroll = Math.max(0, this.totalContentHeight - SCROLL_AREA_HEIGHT);
        this.scrollOffset = Phaser.Math.Clamp(
          this.scrollOffset + deltaY * 0.6,
          0,
          maxScroll
        );
        this.scrollContainer.setY(SCROLL_AREA_TOP - this.scrollOffset);
      }
    );
  }

  // =====================================================================
  //  BOUTON RETOUR
  // =====================================================================

  private createBackButton(width: number): void {
    const btn = this.add.text(width / 2, 770, 'Retour au menu', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#555566',
      padding: { x: 18, y: 9 },
      fontFamily: 'Courier New',
    })
      .setOrigin(0.5, 1)
      .setInteractive();

    btn.on('pointerover', () => btn.setBackgroundColor('#666677'));
    btn.on('pointerout', () => btn.setBackgroundColor('#555566'));
    btn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
