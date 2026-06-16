export interface Booking {
  id: number;
  tourPlanId: number;
  userId: number;
  type: 'FLIGHT' | 'HOTEL' | 'TRAIN' | 'TAXI';
  referenceNumber: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  bookingDate: string;
}

export interface FlightDetail {
  id: number;
  bookingId: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
}

export interface HotelDetail {
  id: number;
  bookingId: number;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
}

export interface TrainDetail {
  id: number;
  bookingId: number;
  trainNumber: string;
  sourceStation: string;
  destinationStation: string;
  coachClass: string;
  pnr: string;
}

export interface TaxiDetail {
  id: number;
  bookingId: number;
  taxiType: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: string;
  driverName: string;
  driverPhone: string;
}

export interface BookingResponse {
  booking: Booking;
  flightDetail?: FlightDetail;
  hotelDetail?: HotelDetail;
  trainDetail?: TrainDetail;
  taxiDetail?: TaxiDetail;
}

export interface BookingRequest {
  tourPlanId: number;
  userId: number;
  type: string;
  price: number;
  
  // Flight Details
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureTime?: string;
  arrivalTime?: string;
  seatNumber?: string;

  // Hotel Details
  hotelName?: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestsCount?: number;

  // Train Details
  trainNumber?: string;
  sourceStation?: string;
  destinationStation?: string;
  coachClass?: string;

  // Taxi Details
  taxiType?: string;
  pickupLocation?: string;
  dropLocation?: string;
  pickupTime?: string;
}
