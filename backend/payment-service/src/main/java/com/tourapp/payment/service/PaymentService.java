package com.tourapp.payment.service;

import com.tourapp.common.exception.ResourceNotFoundException;
import com.tourapp.payment.client.BookingClient;
import com.tourapp.payment.dto.PaymentRequest;
import com.tourapp.payment.dto.PaymentResponse;
import com.tourapp.payment.entity.Invoice;
import com.tourapp.payment.entity.Payment;
import com.tourapp.payment.repository.InvoiceRepository;
import com.tourapp.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final BookingClient bookingClient;

    public PaymentService(PaymentRepository paymentRepository,
                          InvoiceRepository invoiceRepository,
                          BookingClient bookingClient) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.bookingClient = bookingClient;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        String txId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 1. Save Payment
        Payment payment = Payment.builder()
                .bookingId(request.getBookingId())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod().toUpperCase())
                .transactionId(txId)
                .status("SUCCESS")
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 2. Generate Invoice (18% tax)
        double tax = request.getAmount() * 0.18;
        String invoiceNum = "INV-" + (100000 + new Random().nextInt(900000));
        
        Invoice invoice = Invoice.builder()
                .paymentId(savedPayment.getId())
                .invoiceNumber(invoiceNum)
                .taxAmount(tax)
                .totalAmount(request.getAmount() + tax)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 3. Confirm Booking in booking-service via Feign client
        try {
            bookingClient.confirmBooking(request.getBookingId());
        } catch (Exception e) {
            System.err.println("Failed to confirm booking: " + e.getMessage());
        }

        return PaymentResponse.builder()
                .payment(savedPayment)
                .invoice(savedInvoice)
                .build();
    }

    public PaymentResponse getPaymentDetails(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking id " + bookingId));
        
        Invoice invoice = invoiceRepository.findByPaymentId(payment.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for payment id " + payment.getId()));

        return PaymentResponse.builder()
                .payment(payment)
                .invoice(invoice)
                .build();
    }
}
