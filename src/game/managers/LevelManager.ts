import { LevelData, Team } from '@/types';

/**
 * Gestionnaire des niveaux/scénarios
 */
export class LevelManager {
  private levels: Map<string, LevelData> = new Map();

  /**
   * Sauvegarde un niveau
   */
  public saveLevel(level: LevelData): void {
    level.modified = new Date();
    this.levels.set(level.id, { ...level });
    this.persistToStorage();
  }

  /**
   * Charge un niveau par son ID
   */
  public loadLevel(levelId: string): LevelData | null {
    return this.levels.get(levelId) || null;
  }

  /**
   * Supprime un niveau
   */
  public deleteLevel(levelId: string): boolean {
    const deleted = this.levels.delete(levelId);
    if (deleted) {
      this.persistToStorage();
    }
    return deleted;
  }

  /**
   * Retourne la liste de tous les niveaux
   */
  public getAllLevels(): LevelData[] {
    return Array.from(this.levels.values());
  }

  /**
   * Crée un nouveau niveau vide
   */
  public createNewLevel(name: string, description: string): LevelData {
    const level: LevelData = {
      id: this.generateId(),
      name,
      description,
      attackPlayers: [],
      defensePlayers: [],
      ballPosition: { x: 600, y: 700 },
      created: new Date(),
      modified: new Date()
    };

    this.saveLevel(level);
    return level;
  }

  /**
   * Génère un ID unique pour un niveau
   */
  private generateId(): string {
    return `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sauvegarde les niveaux dans le localStorage
   */
  private persistToStorage(): void {
    try {
      const data = Array.from(this.levels.entries());
      localStorage.setItem('rugbySimulator_levels', JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des niveaux:', error);
    }
  }

  /**
   * Charge les niveaux depuis le localStorage
   */
  public loadFromStorage(): void {
    try {
      const data = localStorage.getItem('rugbySimulator_levels');
      if (data) {
        const entries: [string, LevelData][] = JSON.parse(data);
        this.levels = new Map(entries.map(([id, level]) => [
          id,
          {
            ...level,
            created: new Date(level.created),
            modified: new Date(level.modified)
          }
        ]));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des niveaux:', error);
      this.levels.clear();
    }
  }

  /**
   * Crée un niveau d'exemple pour les tests
   */
  public createExampleLevel(): LevelData {
    return this.createLevel1();
  }

  /**
   * Crée le niveau 1 — 2v1
   */
  public createLevel1(): LevelData {
    const level: LevelData = {
      id: 'level_1',
      name: 'Niveau 1 — 2v1',
      description: '2 attaquants vs 1 défenseur',
      attackPlayers: [
        {
          id: 1,
          team: Team.ATTACK,
          position: { x: 500, y: 600 },
          stats: { force: 80, vitesse: 85 },
          hasBall: true
        },
        {
          id: 2,
          team: Team.ATTACK,
          position: { x: 650, y: 630 },
          stats: { force: 75, vitesse: 90 },
          hasBall: false
        }
      ],
      defensePlayers: [
        {
          id: 11,
          team: Team.DEFENSE,
          position: { x: 550, y: 350 },
          stats: { force: 85, vitesse: 80 },
          hasBall: false
        }
      ],
      ballPosition: { x: 500, y: 600 },
      created: new Date(),
      modified: new Date()
    };

    this.saveLevel(level);
    return level;
  }
}