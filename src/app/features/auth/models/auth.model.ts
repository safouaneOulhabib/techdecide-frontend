export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  token: string;
  email: string;
  name: string;
  appRole: string;
  teamRole: string | null;
  teamId: number | null;
};