export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  phone: string;
  avatarUrl: string;
  preferences: string; // JSON String
}

export interface Passenger {
  id?: number;
  userId: number;
  fullName: string;
  age: number;
  gender: string;
  passportNumber: string;
}
