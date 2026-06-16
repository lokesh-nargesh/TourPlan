package com.tourapp.user.service;

import com.tourapp.common.exception.ResourceNotFoundException;
import com.tourapp.user.entity.Passenger;
import com.tourapp.user.entity.UserProfile;
import com.tourapp.user.repository.PassengerRepository;
import com.tourapp.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserProfileRepository profileRepository;
    private final PassengerRepository passengerRepository;

    public UserService(UserProfileRepository profileRepository, PassengerRepository passengerRepository) {
        this.profileRepository = profileRepository;
        this.passengerRepository = passengerRepository;
    }

    public UserProfile getProfile(Long userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> {
                    // Create dynamic profile if user registers but hasn't updated profile yet
                    UserProfile newProfile = UserProfile.builder()
                            .userId(userId)
                            .fullName("New User")
                            .phone("")
                            .avatarUrl("")
                            .preferences("")
                            .build();
                    return profileRepository.save(newProfile);
                });
    }

    public UserProfile updateProfile(Long userId, UserProfile profileDetails) {
        UserProfile profile = getProfile(userId);
        profile.setFullName(profileDetails.getFullName());
        profile.setPhone(profileDetails.getPhone());
        profile.setAvatarUrl(profileDetails.getAvatarUrl());
        profile.setPreferences(profileDetails.getPreferences());
        return profileRepository.save(profile);
    }

    public List<Passenger> getPassengersByUserId(Long userId) {
        return passengerRepository.findByUserId(userId);
    }

    public Passenger savePassenger(Long userId, Passenger passenger) {
        passenger.setUserId(userId);
        return passengerRepository.save(passenger);
    }

    public void deletePassenger(Long userId, Long passengerId) {
        Passenger passenger = passengerRepository.findById(passengerId)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger not found with id " + passengerId));
        if (!passenger.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized action: Passenger does not belong to user.");
        }
        passengerRepository.delete(passenger);
    }
}
