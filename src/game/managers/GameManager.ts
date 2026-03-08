import { Position, PlayerData, PlayerOrder, GameState, LevelData, FieldConfig, PlayerAction, Team } from '@/types';
import { calculateDistance, normalizeVector } from '@/utils/GameUtils';

/**
 * Gestionnaire principal du jeu de rugby — Mode Live
 *
 * Le jeu tourne en temps réel. Chaque frame, les joueurs avancent
 * dans leur direction assignée. L'utilisateur met en pause (ESPACE)
 * pour donner de nouveaux ordres (direction / passe).
 */
export class GameManager {
  // --- état global ---
  private state: GameState = GameState.PAUSED;
  private fieldConfig: FieldConfig;

  // --- joueurs ---
  private attackPlayers: Map<number, PlayerData> = new Map();
  private defensePlayers: Map<number, PlayerData> = new Map();

  // --- ordres courants (direction de course pour chaque joueur d'attaque) ---
  private orders: Map<number, PlayerOrder> = new Map();
  /** Sauvegarde les directions RUN des joueurs pour les utiliser après une passe */
  private playerRunDirection: Map<number, Position> = new Map();

  // --- ballon ---
  private ballCarrierId: number | null = null;
  private ballPosition: Position = { x: 0, y: 0 };
  /** Quand le ballon est en vol (passe ou coup de pied), ces champs sont renseignés */
  private ballInFlight: {
    from: Position;
    to: Position;
    progress: number;       // 0→1
    speed: number;          // pixels / seconde
    passerId: number;
    isKick: boolean;        // true = coup de pied, non interceptable en vol
  } | null = null;

  // --- callbacks vers la scène ---
  private onTryScore: (() => void) | null = null;
  private onTackle: (() => void) | null = null;
  private onInterception: (() => void) | null = null;

  // --- constantes de gameplay ---
  /** Vitesse de base en px/s pour un joueur avec vitesse = 100 */
  private static readonly BASE_SPEED = 200;
  /** Vitesse de la passe en px/s */
  private static readonly PASS_SPEED = 500;
  /** Distance max d'une passe en px */
  private static readonly MAX_PASS_DISTANCE = 250;
  /** Distance max d'un coup de pied en px (3× la passe) */
  private static readonly MAX_KICK_DISTANCE = 300;
  /** Rayon de plaquage en px */
  private static readonly TACKLE_RADIUS = 15;
  /** Rayon d'interception/réception du ballon en vol */
  private static readonly CATCH_RADIUS = 40;


  constructor(fieldConfig: FieldConfig) {
    this.fieldConfig = fieldConfig;
  }

  // =====================================================================
  //  CALLBACKS
  // =====================================================================

  public setOnTryScoreCallback(cb: () => void): void { this.onTryScore = cb; }
  public setOnTackleCallback(cb: () => void): void { this.onTackle = cb; }
  public setOnInterceptionCallback(cb: () => void): void { this.onInterception = cb; }

  // =====================================================================
  //  INITIALISATION
  // =====================================================================

  /**
   * Charge un niveau et remet le jeu en pause.
   */
  public initializeLevel(levelData: LevelData): void {
    this.attackPlayers.clear();
    this.defensePlayers.clear();
    this.orders.clear();
    this.playerRunDirection.clear();
    this.ballInFlight = null;

    levelData.attackPlayers.forEach(p => {
      this.attackPlayers.set(p.id, { ...p, position: { ...p.position }, stats: { ...p.stats } });
      if (p.hasBall) this.ballCarrierId = p.id;
    });

    levelData.defensePlayers.forEach(p => {
      this.defensePlayers.set(p.id, { ...p, position: { ...p.position }, stats: { ...p.stats } });
    });

    this.ballPosition = { ...levelData.ballPosition };
    this.state = GameState.PAUSED;

    // Ordre par défaut : tout le monde court vers le haut (vers l'en-but)
    this.attackPlayers.forEach((_p, id) => {
      this.orders.set(id, { action: PlayerAction.RUN, direction: { x: 0, y: -1 } });
    });
  }

  // =====================================================================
  //  ORDRES (donnés pendant la pause)
  // =====================================================================

  /**
   * Assigne un ordre à un joueur d'attaque.
   */
  public setOrder(playerId: number, order: PlayerOrder): void {
    if (!this.attackPlayers.has(playerId)) return;
    this.orders.set(playerId, order);

    // Sauvegarder la direction RUN pour la réutiliser après une passe
    if (order.action === PlayerAction.RUN) {
      this.playerRunDirection.set(playerId, { ...order.direction });
    }
  }

  /**
   * Récupère l'ordre courant d'un joueur.
   */
  public getOrder(playerId: number): PlayerOrder | undefined {
    return this.orders.get(playerId);
  }

  // =====================================================================
  //  CONTRÔLE DU JEU
  // =====================================================================

  public pause(): void {
    if (this.state === GameState.RUNNING) {
      this.state = GameState.PAUSED;
    }
  }

  public resume(): void {
    if (this.state === GameState.PAUSED) {
      // Convertir les ordres de passe : exécuter la passe immédiatement au resume
      this.processPassOrders();
      this.state = GameState.RUNNING;
    }
  }

  public getState(): GameState {
    return this.state;
  }

  // =====================================================================
  //  BOUCLE PRINCIPALE — appelée chaque frame par GameScene.update()
  // =====================================================================

  /**
   * Met à jour l'état du jeu.  
   * @param delta temps écoulé depuis la dernière frame (ms)
   */
  public update(delta: number): void {
    if (this.state !== GameState.RUNNING) return;

    const dt = delta / 1000; // en secondes

    // 1. Déplacer les joueurs d'attaque
    this.moveAttackPlayers(dt);

    // 2. Déplacer les défenseurs (IA)
    this.moveDefensePlayers(dt);

    // 3. Faire avancer le ballon en vol (passe)
    this.updateBallInFlight(dt);

    // 4. Vérifier les interceptions (défenseur touche le ballon)
    if (this.checkDefenderInterception()) return; // fin de jeu si interception

    // 5. Vérifier les essais
    if (this.checkTryScore()) return;

    // 6. Mettre à jour la position du ballon (suit le porteur)
    this.syncBallPosition();
  }

  // =====================================================================
  //  MOUVEMENTS
  // =====================================================================

  private moveAttackPlayers(dt: number): void {
    // Ligne de hors-jeu : exactement au niveau du porteur du ballon
    const offsideLine = this.ballPosition.y;

    this.attackPlayers.forEach((player, id) => {
      const order = this.orders.get(id);
      if (!order || order.action !== PlayerAction.RUN) return;

      const speed = (player.stats.vitesse / 100) * GameManager.BASE_SPEED;
      const dx = order.direction.x * speed * dt;
      const dy = order.direction.y * speed * dt;

      player.position.x = this.clampX(player.position.x + dx);

      // Un attaquant sans ballon ne peut pas dépasser la ligne de hors-jeu
      if (player.hasBall) {
        player.position.y = this.clampY(player.position.y + dy);
      } else {
        player.position.y = this.clampY(Math.max(player.position.y + dy, offsideLine));
      }
    });
  }

  private moveDefensePlayers(dt: number): void {
    // IA simple : chaque défenseur se déplace vers le porteur de ballon
    const target = this.getBallTargetPosition();

    this.defensePlayers.forEach(defender => {
      const dir = normalizeVector({
        x: target.x - defender.position.x,
        y: target.y - defender.position.y
      });

      const speed = (defender.stats.vitesse / 100) * GameManager.BASE_SPEED * 0.85; // un peu plus lent
      defender.position.x = this.clampX(defender.position.x + dir.x * speed * dt);
      defender.position.y = this.clampY(defender.position.y + dir.y * speed * dt);
    });
  }

  /** Renvoie la position vers laquelle les défenseurs convergent */
  private getBallTargetPosition(): Position {
    if (this.ballCarrierId !== null) {
      const carrier = this.attackPlayers.get(this.ballCarrierId);
      if (carrier) return carrier.position;
    }
    return this.ballPosition;
  }

  // =====================================================================
  //  PASSES
  // =====================================================================

  /**
   * Au moment du resume, toute action PASS est convertie en vol du ballon.
   */
  private processPassOrders(): void {
    this.orders.forEach((order, playerId) => {
      if (order.action !== PlayerAction.PASS && order.action !== PlayerAction.KICK) return;

      const player = this.attackPlayers.get(playerId);
      if (!player || !player.hasBall) return;

      const isKick = order.action === PlayerAction.KICK;
      const maxDist = isKick ? GameManager.MAX_KICK_DISTANCE : GameManager.MAX_PASS_DISTANCE;
      const previousDirection = this.playerRunDirection.get(playerId) || { x: 0, y: -1 };

      const from: Position = { ...player.position };
      const to: Position = {
        x: player.position.x + order.direction.x * maxDist,
        y: player.position.y + order.direction.y * maxDist
      };

      player.hasBall = false;
      this.ballCarrierId = null;

      this.ballInFlight = {
        from,
        to,
        progress: 0,
        speed: GameManager.PASS_SPEED,
        passerId: playerId,
        isKick,
      };

      this.orders.set(playerId, { action: PlayerAction.RUN, direction: previousDirection });
    });
  }

  private updateBallInFlight(dt: number): void {
    if (!this.ballInFlight) return;

    const flight = this.ballInFlight;
    const totalDist = calculateDistance(flight.from, flight.to);
    if (totalDist === 0) {
      this.ballInFlight = null;
      return;
    }

    const progressIncrement = (flight.speed * dt) / totalDist;
    flight.progress = Math.min(flight.progress + progressIncrement, 1);

    // Position actuelle du ballon en vol
    const currentPos: Position = {
      x: flight.from.x + (flight.to.x - flight.from.x) * flight.progress,
      y: flight.from.y + (flight.to.y - flight.from.y) * flight.progress
    };
    this.ballPosition = currentPos;

    // Vérifier si un joueur attrape / intercepte le ballon
    // Un coup de pied ne peut pas être intercepté en vol par les défenseurs
    const catcher = this.findCatcher(currentPos, flight.passerId, flight.isKick);
    if (catcher) {
      console.log(`[CATCH] Joueur ${catcher.id} (${catcher.team}) a attrapé le ballon en vol`);
      this.ballInFlight = null;

      // Si c'est un défenseur: INTERCEPTION
      if (catcher.team === Team.DEFENSE) {
        console.log(`[INTERCEPTION] Défenseur ${catcher.id} a intercepté le ballon en vol`);
        catcher.hasBall = true;
        this.ballCarrierId = catcher.id;
        this.ballPosition = { ...catcher.position };
        this.state = GameState.GAME_OVER;
        if (this.onInterception) {
          console.log(`[CALLBACK] Déclenchement du callback onInterception (vol)`);
          this.onInterception();
        }
        return;
      }

      // Si c'est un attaquant: il reçoit le ballon
      catcher.hasBall = true;
      this.ballCarrierId = catcher.id;
      this.ballPosition = { ...catcher.position };
      return;
    }

    // Ballon arrivé à destination sans être attrapé → tombe au sol
    if (flight.progress >= 1) {
      const wasKick = flight.isKick;
      this.ballInFlight = null;
      this.tryPickupBall(wasKick);
    }
  }

  /**
   * Cherche un joueur (attaque ou défense) capable d'attraper le ballon en vol.
   * Les défenseurs ont priorité pour les interceptions.
   */
  private findCatcher(ballPos: Position, passerId: number, isKick: boolean = false): PlayerData | null {
    // Les défenseurs ne peuvent intercepter qu'une passe (pas un coup de pied en vol)
    if (!isKick) {
      for (const [, player] of this.defensePlayers) {
        if (calculateDistance(player.position, ballPos) <= GameManager.CATCH_RADIUS) {
          return player;
        }
      }
    }
    // Attaquants (sauf l'expéditeur)
    for (const [, player] of this.attackPlayers) {
      if (player.id === passerId) continue;
      if (calculateDistance(player.position, ballPos) <= GameManager.CATCH_RADIUS) {
        return player;
      }
    }
    return null;
  }

  /**
   * Quand le ballon est au sol, le joueur le plus proche le ramasse.
   * Si c'est un défenseur → INTERCEPTION
   */
  private tryPickupBall(isKick: boolean = false): void {
    // Chercher le défenseur le plus proche
    let closestDefender: PlayerData | null = null;
    let minDistDefense = Infinity;

    for (const [, player] of this.defensePlayers) {
      const d = calculateDistance(player.position, this.ballPosition);
      if (d < minDistDefense && d <= GameManager.CATCH_RADIUS * 1.5) {
        minDistDefense = d;
        closestDefender = player;
      }
    }

    // Si un défenseur a ramassé le ballon → INTERCEPTION (sauf après un coup de pied)
    if (closestDefender !== null && !isKick) {
      console.log(`[INTERCEPTION] Défenseur ${closestDefender.id} a ramassé le ballon au sol`);
      const defender = closestDefender;
      defender.hasBall = true;
      this.ballCarrierId = defender.id;
      this.ballPosition = { ...defender.position };
      this.state = GameState.GAME_OVER;
      if (this.onInterception) {
        console.log(`[CALLBACK] Déclenchement du callback onInterception (ramassé)`);
        this.onInterception();
      }
      return;
    }

    // Chercher l'attaquant le plus proche
    let closestAttacker: PlayerData | null = null;
    let minDistAttack = Infinity;

    for (const [, player] of this.attackPlayers) {
      const d = calculateDistance(player.position, this.ballPosition);
      if (d < minDistAttack && d <= GameManager.CATCH_RADIUS * 1.5) {
        minDistAttack = d;
        closestAttacker = player;
      }
    }

    // Un attaquant ramasse le ballon
    if (closestAttacker !== null) {
      const attacker = closestAttacker;
      attacker.hasBall = true;
      this.ballCarrierId = attacker.id;
      this.ballPosition = { ...attacker.position };
    }
  }

  // =====================================================================
  //  PLAQUAGES & CONDITIONS DE VICTOIRE
  // =====================================================================

  /**
   * Vérifie si un défenseur a touché le ballon (plaquage ou interception).
   * - Plaquage: défenseur touche l'attaquant qui porte le ballon
   * - Interception: défenseur attrape le ballon au sol ou en vol
   */
  private checkDefenderInterception(): boolean {
    // Cas 1: Défenseur plaque le porteur du ballon (attaquant uniquement)
    if (this.ballCarrierId !== null) {
      const carrier = this.attackPlayers.get(this.ballCarrierId);

      if (carrier) {
        for (const [, defender] of this.defensePlayers) {
          // Éviter qu'un défenseur ne se plaque lui-même
          if (defender.id === carrier.id) continue;

          const distance = calculateDistance(carrier.position, defender.position);
          console.log(`[DEBUG] Carrier ${carrier.id} vs Defender ${defender.id}: distance=${distance.toFixed(1)}, TACKLE_RADIUS=${GameManager.TACKLE_RADIUS}`);

          if (distance < GameManager.TACKLE_RADIUS) {
            // PLAQUAGE !
            console.log(`[PLAQUAGE] Défenseur ${defender.id} a plaqué l'attaquant ${carrier.id}`);
            carrier.hasBall = false;
            this.ballCarrierId = null;
            this.state = GameState.GAME_OVER;
            if (this.onTackle) {
              console.log(`[CALLBACK] Déclenchement du callback onTackle`);
              this.onTackle();
            }
            return true;
          }
        }
      }
    }

    // Cas 2: Le ballon est au sol et un défenseur le récupère
    if (this.ballCarrierId === null && !this.ballInFlight) {
      console.log(`[DEBUG] Ballon au sol à ${this.ballPosition.x}, ${this.ballPosition.y}`);
      for (const [, defender] of this.defensePlayers) {
        const distance = calculateDistance(defender.position, this.ballPosition);
        console.log(`[DEBUG] Défenseur ${defender.id} - distance au ballon: ${distance.toFixed(1)}, CATCH_RADIUS*1.5=${GameManager.CATCH_RADIUS * 1.5}`);

        if (distance <= GameManager.CATCH_RADIUS * 1.5) {
          // INTERCEPTION !
          console.log(`[INTERCEPTION] Défenseur ${defender.id} a récupéré le ballon au sol`);
          defender.hasBall = true;
          this.ballCarrierId = defender.id;
          this.ballPosition = { ...defender.position };
          this.state = GameState.GAME_OVER;
          if (this.onInterception) {
            console.log(`[CALLBACK] Déclenchement du callback onInterception (ballon au sol)`);
            this.onInterception();
          }
          return true;
        }
      }
    }

    return false;
  }

  private checkTryScore(): boolean {
    if (this.ballCarrierId === null) return false;
    const carrier = this.attackPlayers.get(this.ballCarrierId);
    if (!carrier) return false;

    // Vérifier que c'est bien un attaquant (pas un défenseur qui a intercepté)
    if (carrier.team !== Team.ATTACK) return false;

    if (carrier.position.y <= this.fieldConfig.tryLineY) {
      this.state = GameState.GAME_OVER;
      if (this.onTryScore) this.onTryScore();
      return true;
    }
    return false;
  }

  // =====================================================================
  //  UTILITAIRES
  // =====================================================================

  private syncBallPosition(): void {
    if (this.ballInFlight) return; // le ballon en vol est géré ailleurs
    if (this.ballCarrierId !== null) {
      const carrier = this.attackPlayers.get(this.ballCarrierId);
      if (carrier) {
        this.ballPosition = { ...carrier.position };
      }
    }
  }

  private clampX(x: number): number {
    return Math.max(this.fieldConfig.bounds.left, Math.min(x, this.fieldConfig.bounds.right));
  }

  private clampY(y: number): number {
    return Math.max(this.fieldConfig.bounds.top, Math.min(y, this.fieldConfig.bounds.bottom));
  }

  // =====================================================================
  //  GETTERS PUBLICS
  // =====================================================================

  public getAttackPlayers(): Map<number, PlayerData> { return this.attackPlayers; }
  public getDefensePlayers(): Map<number, PlayerData> { return this.defensePlayers; }
  public getBallPosition(): Position { return { ...this.ballPosition }; }
  public getBallCarrierId(): number | null { return this.ballCarrierId; }
  public isBallInFlight(): boolean { return this.ballInFlight !== null; }
  public getFieldConfig(): FieldConfig { return this.fieldConfig; }
}