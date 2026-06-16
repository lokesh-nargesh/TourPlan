package com.tourapp.payment.controller;

import com.tourapp.common.dto.ApiResponse;
import com.tourapp.payment.dto.PaymentRequest;
import com.tourapp.payment.dto.PaymentResponse;
import com.tourapp.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment completed successfully!"));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentDetails(@PathVariable Long bookingId) {
        PaymentResponse response = paymentService.getPaymentDetails(bookingId);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment details retrieved."));
    }
}
