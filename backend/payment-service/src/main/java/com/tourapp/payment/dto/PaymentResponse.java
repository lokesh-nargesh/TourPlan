package com.tourapp.payment.dto;

import com.tourapp.payment.entity.Invoice;
import com.tourapp.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Payment payment;
    private Invoice invoice;
}
