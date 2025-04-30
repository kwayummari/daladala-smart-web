// contexts/BookingContext.jsx
import { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [pickupStop, setPickupStop] = useState(null);
  const [dropoffStop, setDropoffStop] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [fareAmount, setFareAmount] = useState(0);

  const clearBookingData = () => {
    setSelectedRoute(null);
    setSelectedTrip(null);
    setPickupStop(null);
    setDropoffStop(null);
    setPassengerCount(1);
    setFareAmount(0);
  };

  const value = {
    selectedRoute,
    setSelectedRoute,
    selectedTrip,
    setSelectedTrip,
    pickupStop,
    setPickupStop,
    dropoffStop,
    setDropoffStop,
    passengerCount,
    setPassengerCount,
    fareAmount,
    setFareAmount,
    clearBookingData,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};