import { LevelData, Team } from '@/types';

// ─── Niveaux built-in définis en dur ────────────────────────────────────────

const BUILT_IN_LEVELS: LevelData[] = [
  {
    id: 'level_1',
    name: 'Niveau 1 — 2v1',
    description: '2 attaquants vs 1 defenseur',
    attackPlayers: [
      {
        id: 1,
        team: Team.ATTACK,
        position: { x: 500, y: 600 },
        stats: { force: 80, vitesse: 85 },
        hasBall: true,
      },
      {
        id: 2,
        team: Team.ATTACK,
        position: { x: 650, y: 630 },
        stats: { force: 75, vitesse: 90 },
        hasBall: false,
      },
    ],
    defensePlayers: [
      {
        id: 11,
        team: Team.DEFENSE,
        position: { x: 550, y: 350 },
        stats: { force: 85, vitesse: 80 },
        hasBall: false,
      },
    ],
    ballPosition: { x: 500, y: 600 },
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
  {
    id: 'level_2',
    name: 'Niveau 2 — 3v2',
    description: '3 attaquants vs 2 defenseurs',
    attackPlayers: [
      {
        id: 1,
        team: Team.ATTACK,
        position: { x: 450, y: 620 },
        stats: { force: 80, vitesse: 85 },
        hasBall: true,
      },
      {
        id: 2,
        team: Team.ATTACK,
        position: { x: 600, y: 640 },
        stats: { force: 75, vitesse: 90 },
        hasBall: false,
      },
      {
        id: 3,
        team: Team.ATTACK,
        position: { x: 750, y: 620 },
        stats: { force: 78, vitesse: 88 },
        hasBall: false,
      },
    ],
    defensePlayers: [
      {
        id: 11,
        team: Team.DEFENSE,
        position: { x: 500, y: 380 },
        stats: { force: 85, vitesse: 80 },
        hasBall: false,
      },
      {
        id: 12,
        team: Team.DEFENSE,
        position: { x: 700, y: 360 },
        stats: { force: 82, vitesse: 83 },
        hasBall: false,
      },
    ],
    ballPosition: { x: 450, y: 620 },
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'rugbySimulator_customLevels';

/**
 * Store centralisé pour tous les niveaux.
 *
 * - Les niveaux built-in sont définis statiquement dans ce fichier.
 * - Les niveaux personnalisés (créés via l'éditeur) sont persistés
 *   dans le localStorage et chargés au démarrage.
 */
class LevelStoreClass {
  private customLevels: LevelData[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /** Retourne tous les niveaux (built-in puis personnalisés). */
  public getAll(): LevelData[] {
    return [...BUILT_IN_LEVELS, ...this.customLevels];
  }

  /** Retourne un niveau par son id, ou null. */
  public getById(id: string): LevelData | null {
    return this.getAll().find(l => l.id === id) ?? null;
  }

  /** Sauvegarde un niveau personnalisé (ajout ou mise à jour). */
  public save(level: LevelData): void {
    level.modified = new Date();
    const idx = this.customLevels.findIndex(l => l.id === level.id);
    if (idx >= 0) {
      this.customLevels[idx] = { ...level };
    } else {
      this.customLevels.push({ ...level });
    }
    this.persistToStorage();
  }

  // ── Persistance localStorage ────────────────────────────────────────────

  private persistToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customLevels));
    } catch (e) {
      console.error('LevelStore: erreur sauvegarde', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: LevelData[] = JSON.parse(raw);
      this.customLevels = parsed.map(l => ({
        ...l,
        created: new Date(l.created),
        modified: new Date(l.modified),
      }));
    } catch (e) {
      console.error('LevelStore: erreur chargement', e);
      this.customLevels = [];
    }
  }
}

export const LevelStore = new LevelStoreClass();
