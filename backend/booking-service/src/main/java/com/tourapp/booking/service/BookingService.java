package com.tourapp.booking.service;

import com.tourapp.booking.client.TourPlanClient;
import com.tourapp.booking.dto.BookingRequest;
import com.tourapp.booking.dto.BookingResponse;
import com.tourapp.booking.entity.*;
import com.tourapp.booking.repository.*;
import com.tourapp.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightDetailRepository flightRepository;
    private final HotelDetailRepository hotelRepository;
    private final TrainDetailRepository trainRepository;
    private final TaxiDetailRepository taxiRepository;
    private final TourPlanClient tourPlanClient;

    public BookingService(BookingRepository bookingRepository,
                          FlightDetailRepository flightRepository,
                          HotelDetailRepository hotelRepository,
                          TrainDetailRepository trainRepository,
                          TaxiDetailRepository taxiRepository,
                          TourPlanClient tourPlanClient) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
        this.trainRepository = trainRepository;
        this.taxiRepository = taxiRepository;
        this.tourPlanClient = tourPlanClient;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        String refNum = "BK-" + request.getType().substring(0, 3).toUpperCase() + "-" + (100000 + new Random().nextInt(900000));

        // 1. Create Base Booking
        Booking booking = Booking.builder()
                .tourPlanId(request.getTourPlanId())
                .userId(request.getUserId())
                .type(request.getType().toUpperCase())
                .referenceNumber(refNum)
                .price(request.getPrice())
                .status("PENDING")
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        FlightBookingDetail flightDetail = null;
        HotelBookingDetail hotelDetail = null;
        TrainBookingDetail trainDetail = null;
        TaxiBookingDetail taxiDetail = null;

        // 2. Create Specific Booking Details
        switch (request.getType().toUpperCase()) {
            case "FLIGHT":
                flightDetail = FlightBookingDetail.builder()
                        .bookingId(savedBooking.getId())
                        .flightNumber(request.getFlightNumber())
                        .departureAirport(request.getDepartureAirport())
                        .arrivalAirport(request.getArrivalAirport())
                        .departureTime(request.getDepartureTime())
                        .arrivalTime(request.getArrivalTime())
                        .seatNumber(request.getSeatNumber() != null ? request.getSeatNumber() : "12A")
                        .build();
                flightRepository.save(flightDetail);
                break;

            case "HOTEL":
                hotelDetail = HotelBookingDetail.builder()
                        .bookingId(savedBooking.getId())
                        .hotelName(request.getHotelName())
                        .roomType(request.getRoomType() != null ? request.getRoomType() : "Standard Double")
                        .checkInDate(request.getCheckInDate())
                        .checkOutDate(request.getCheckOutDate())
                        .guestsCount(request.getGuestsCount() != null ? request.getGuestsCount() : 1)
                        .build();
                hotelRepository.save(hotelDetail);
                break;

            case "TRAIN":
                trainDetail = TrainBookingDetail.builder()
                        .bookingId(savedBooking.getId())
                        .trainNumber(request.getTrainNumber())
                        .sourceStation(request.getSourceStation())
                        .destinationStation(request.getDestinationStation())
                        .coachClass(request.getCoachClass() != null ? request.getCoachClass() : "AC 3 Tier")
                        .pnr("PNR-" + (1000000 + new Random().nextInt(9000000)))
                        .build();
                trainRepository.save(trainDetail);
                break;

            case "TAXI":
                taxiDetail = TaxiBookingDetail.builder()
                        .bookingId(savedBooking.getId())
                        .taxiType(request.getTaxiType() != null ? request.getTaxiType() : "Sedan")
                        .pickupLocation(request.getPickupLocation())
                        .dropLocation(request.getDropLocation())
                        .pickupTime(request.getPickupTime())
                        .driverName("Driver " + (1 + new Random().nextInt(50)))
                        .driverPhone("+1-555-019" + new Random().nextInt(10))
                        .build();
                taxiRepository.save(taxiDetail);
                break;
            default:
                throw new IllegalArgumentException("Unknown booking type: " + request.getType());
        }

        // 3. Update Tour Planning Service spent budget using OpenFeign client
        try {
            tourPlanClient.addSpentBudget(request.getTourPlanId(), request.getType().toUpperCase(), request.getPrice());
        } catch (Exception e) {
            System.err.println("Failed to update budget in tour-planning-service: " + e.getMessage());
        }

        return BookingResponse.builder()
                .booking(savedBooking)
                .flightDetail(flightDetail)
                .hotelDetail(hotelDetail)
                .trainDetail(trainDetail)
                .taxiDetail(taxiDetail)
                .build();
    }

    @Transactional
    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));
        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));
        if (booking.getStatus().equals("CANCELLED")) {
            return booking;
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        // Deduct from budget spent
        try {
            tourPlanClient.addSpentBudget(booking.getTourPlanId(), booking.getType(), -booking.getPrice());
        } catch (Exception e) {
            System.err.println("Failed to deduct budget in tour-planning-service: " + e.getMessage());
        }

        return saved;
    }

    public List<BookingResponse> getBookingsByPlan(Long tourPlanId) {
        List<Booking> bookings = bookingRepository.findByTourPlanId(tourPlanId);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder().booking(booking);

        switch (booking.getType()) {
            case "FLIGHT":
                flightRepository.findByBookingId(booking.getId()).ifPresent(builder::flightDetail);
                break;
            case "HOTEL":
                hotelRepository.findByBookingId(booking.getId()).ifPresent(builder::hotelDetail);
                break;
            case "TRAIN":
                trainRepository.findByBookingId(booking.getId()).ifPresent(builder::trainDetail);
                break;
            case "TAXI":
                taxiRepository.findByBookingId(booking.getId()).ifPresent(builder::taxiDetail);
                break;
        }

        return builder.build();
    }

    // Mock Search Utilities
    public List<Map<String, Object>> searchFlights(String from, String to) {
        List<Map<String, Object>> flights = new ArrayList<>();
        String[] airlines = {"Air Global", "Skyways", "JetStream", "EcoFly"};
        Random r = new Random();

        for (int i = 0; i < 3; i++) {
            Map<String, Object> f = new HashMap<>();
            f.put("flightNumber", airlines[i % airlines.length].substring(0, 2).toUpperCase() + "-" + (100 + r.nextInt(900)));
            f.put("airline", airlines[i]);
            f.put("departureAirport", from.toUpperCase());
            f.put("arrivalAirport", to.toUpperCase());
            f.put("departureTime", "10:00 AM");
            f.put("arrivalTime", "01:30 PM");
            f.put("price", 150.0 + r.nextInt(150));
            flights.add(f);
        }
        return flights;
    }

    public List<Map<String, Object>> searchHotels(String city) {
        List<Map<String, Object>> hotels = new ArrayList<>();
        String[] hotelNames = {"Grand Imperial", "Comfort Inn", "Urban Oasis Resort", "Backpackers Central"};
        double[] basePrices = {220.0, 95.0, 310.0, 45.0};
        String[] roomTypes = {"Deluxe Suite", "Standard Double", "Premium King", "Shared Dorm"};
        Random r = new Random();

        for (int i = 0; i < hotelNames.length; i++) {
            Map<String, Object> h = new HashMap<>();
            h.put("hotelName", hotelNames[i]);
            h.put("address", i + 12 + " Central Parkway, " + city);
            h.put("rating", 3.5 + (r.nextInt(15) / 10.0));
            h.put("roomType", roomTypes[i]);
            h.put("price", basePrices[i] + r.nextInt(20));
            hotels.add(h);
        }
        return hotels;
    }

    public List<Map<String, Object>> searchTrains(String from, String to) {
        List<Map<String, Object>> trains = new ArrayList<>();
        String[] classes = {"AC First Class", "AC 2 Tier", "AC 3 Tier", "Sleeper"};
        Random r = new Random();

        for (int i = 0; i < 3; i++) {
            Map<String, Object> t = new HashMap<>();
            t.put("trainNumber", "TRN-" + (12000 + r.nextInt(5000)));
            t.put("trainName", "Express Link " + (i + 1));
            t.put("sourceStation", from.toUpperCase());
            t.put("destinationStation", to.toUpperCase());
            t.put("departureTime", "08:15 AM");
            t.put("arrivalTime", "04:45 PM");
            t.put("coachClass", classes[i % classes.length]);
            t.put("price", 35.0 + r.nextInt(50));
            trains.add(t);
        }
        return trains;
    }

    public List<Map<String, Object>> searchTaxis(String location) {
        List<Map<String, Object>> taxis = new ArrayList<>();
        String[] vehicleTypes = {"Mini / Hatchback", "Sedan", "SUV", "Luxury Cabs"};
        double[] basePrices = {25.0, 35.0, 50.0, 90.0};
        Random r = new Random();

        for (int i = 0; i < vehicleTypes.length; i++) {
            Map<String, Object> t = new HashMap<>();
            t.put("taxiType", vehicleTypes[i]);
            t.put("pickupLocation", location);
            t.put("driverName", "Driver " + (10 + r.nextInt(89)));
            t.put("driverPhone", "+1-555-098" + i);
            t.put("price", basePrices[i] + r.nextInt(10));
            t.put("estimatedTime", (15 + r.nextInt(30)) + " mins");
            taxis.add(t);
        }
        return taxis;
    }
}
