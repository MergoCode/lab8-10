import { create } from 'zustand';
import { Movie, User, CartItem } from './types';

interface SeatSelectionState {
  currentMovie: Movie | null;
  currentUser: User | null;
  selectedSeats: string[];
  cart: CartItem[];
  setCurrentMovie: (movie: Movie) => void;
  setCurrentUser: (user: User) => void;
  selectSeat: (seatId: string) => void;
  unselectSeat: (seatId: string) => void;
  addToCart: () => void;
  removeFromCart: (cartItemId: string) => void;
  bookSeats: () => void;
}

export const useSeatSelectionStore = create<SeatSelectionState>((set) => ({
  currentMovie: null,
  currentUser: null,
  selectedSeats: [],
  cart: [],
  
  setCurrentMovie: (movie) => set({ currentMovie: movie }),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  selectSeat: (seatId) => set((state) => {
    const seatIsBooked = state.currentMovie?.seats.find(seat => seat.id === seatId)?.isBooked;
    if (seatIsBooked) return state;
    
    return { 
      selectedSeats: state.selectedSeats.includes(seatId) 
        ? state.selectedSeats.filter(id => id !== seatId) 
        : [...state.selectedSeats, seatId] 
    };
  }),
  
  unselectSeat: (seatId) => set((state) => ({
    selectedSeats: state.selectedSeats.filter(id => id !== seatId)
  })),
  
  addToCart: () => set((state) => {
    if (!state.currentMovie || state.selectedSeats.length === 0) return state;
    
    const newCartItems = state.selectedSeats.map(seatId => {
      const seat = state.currentMovie!.seats.find(s => s.id === seatId)!;
      return {
        seatId,
        movieId: state.currentMovie!.id,
        row: seat.row,
        number: seat.number,
        price: 150, 
      };
    });
    
    return {
      cart: [...state.cart, ...newCartItems],
      selectedSeats: [] 
    };
  }),
  
  removeFromCart: (cartItemId) => set((state) => ({
    cart: state.cart.filter(item => item.seatId !== cartItemId)
  })),
  
  bookSeats: () => set((state) => {
    if (!state.currentMovie || !state.currentUser || state.cart.length === 0) return state;
    
    const seatIdsToBook = state.cart.map(item => item.seatId);
    
    const updatedSeats = state.currentMovie.seats.map(seat => {
      if (seatIdsToBook.includes(seat.id)) {
        return { ...seat, isBooked: true, userId: state.currentUser!.id };
      }
      return seat;
    });
    
    return {
      currentMovie: { ...state.currentMovie, seats: updatedSeats },
      cart: [] 
    };
  })
}));