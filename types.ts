
export interface TimeRecord {
  id: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  duration: number;  // milliseconds
  description: string;
}

export interface User {
  email: string;
  isLoggedIn: boolean;
}
