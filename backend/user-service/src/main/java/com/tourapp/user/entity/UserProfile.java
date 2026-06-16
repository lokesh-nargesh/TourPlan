package com.tourapp.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String preferences; // Simple JSON/text representation of preferences (e.g. dietary, budget/luxury preference, preferred mode of transport)
}
