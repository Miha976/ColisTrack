export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address extends GeoPoint {
  /** Libellé complet affiché : "12 Rue des Lilas 75012 Paris" */
  label: string;
  street: string;
  postcode: string;
  city: string;
}
