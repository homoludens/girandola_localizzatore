export interface Girandola {
  id: string;
  lat: number;
  lng: number;
  userEmail: string;
  createdAt: string;
}

export interface CreateGirandolaPayload {
  lat: number;
  lng: number;
}
