export interface Seat {
    id: string;
    row: number;
    number: number;
    isBooked: boolean;
    userId: string | null;
  }
  
  export interface Movie {
    id: string;
    title: string;
    seats: Seat[];
  }
  
  export interface User {
    id: string;
    name: string;
  }
  
  export interface CartItem {
    seatId: string;
    movieId: string;
    row: number;
    number: number;
    price: number;
  }