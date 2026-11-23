export interface Settings {
  /** Rayon d'alerte en mètres */
  alertRadius: number;
  /** Alerter seulement pour les gros colis */
  largeOnly: boolean;
}

export const DEFAULT_SETTINGS: Settings = { alertRadius: 200, largeOnly: false };
