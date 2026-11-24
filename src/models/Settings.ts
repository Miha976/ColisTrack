export interface Settings {
  /** Rayon de la 1re alerte (approche), en mètres */
  alertRadius: number;
}

/** 2e alerte, fixe : le facteur est devant l'adresse. */
export const ARRIVAL_RADIUS = 50;

export const DEFAULT_SETTINGS: Settings = { alertRadius: 200 };
