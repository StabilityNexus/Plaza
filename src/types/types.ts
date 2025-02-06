interface Token {
    id: string;
    latitude: number;
    longitude: number;
    symbol: string;
    name: string;
    logoUrl: string; // Added logo URL
    backgroundColor: string; // Added background color
  }
  
  interface Crate {
    id: string;
    latitude: number;
    longitude: number;
  }
  interface User {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    avatarUrl: string;
  }
  
  export type { Token, Crate, User };