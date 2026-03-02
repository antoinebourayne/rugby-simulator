/**
 * Utilitaires pour les calculs de jeu
 */

import { Position } from '@/types';

/**
 * Calcule la distance entre deux positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalise un vecteur
 */
export function normalizeVector(vector: Position): Position {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

/**
 * Calcule l'angle entre deux positions (en radians)
 */
export function calculateAngle(from: Position, to: Position): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Convertit des radians en degrés
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Vérifie si deux positions sont proches selon une tolérance
 */
export function isNearPosition(pos1: Position, pos2: Position, tolerance: number = 10): boolean {
  return calculateDistance(pos1, pos2) <= tolerance;
}

/**
 * Limite une valeur entre min et max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Génère un nombre aléatoire entre min et max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Vérifie si une position est dans les limites du terrain
 */
export function isValidFieldPosition(position: Position, fieldWidth: number, fieldHeight: number): boolean {
  return position.x >= 0 && position.x <= fieldWidth && 
         position.y >= 0 && position.y <= fieldHeight;
}