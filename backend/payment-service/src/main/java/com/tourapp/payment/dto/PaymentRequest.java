package com.tourapp.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Long bookingId;
    private Long userId;
    private Double amount;
    private String paymentMethod; // CARD, UPI, NETBANKING
    
    // Card details (Optional / Simulating input)
    private String cardNumber;
    private String expiryDate;
    private String cvv;
}
