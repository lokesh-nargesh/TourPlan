package com.tourapp.user.controller;

import com.tourapp.common.dto.ApiResponse;
import com.tourapp.user.entity.Passenger;
import com.tourapp.user.entity.UserProfile;
import com.tourapp.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserService userService;

    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<UserProfile>> getProfile(@PathVariable Long userId) {
        UserProfile profile = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully."));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<UserProfile>> updateProfile(@PathVariable Long userId, @RequestBody UserProfile profileDetails) {
        UserProfile updatedProfile = userService.updateProfile(userId, profileDetails);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile, "Profile updated successfully."));
    }

    @GetMapping("/passengers/{userId}")
    public ResponseEntity<ApiResponse<List<Passenger>>> getPassengers(@PathVariable Long userId) {
        List<Passenger> passengers = userService.getPassengersByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(passengers, "Passengers list retrieved successfully."));
    }

    @PostMapping("/passengers/{userId}")
    public ResponseEntity<ApiResponse<Passenger>> addPassenger(@PathVariable Long userId, @RequestBody Passenger passenger) {
        Passenger savedPassenger = userService.savePassenger(userId, passenger);
        return ResponseEntity.ok(ApiResponse.success(savedPassenger, "Passenger added successfully."));
    }

    @DeleteMapping("/passengers/{userId}/{passengerId}")
    public ResponseEntity<ApiResponse<String>> deletePassenger(@PathVariable Long userId, @PathVariable Long passengerId) {
        userService.deletePassenger(userId, passengerId);
        return ResponseEntity.ok(ApiResponse.success("Passenger deleted.", "Passenger deleted successfully."));
    }
}
