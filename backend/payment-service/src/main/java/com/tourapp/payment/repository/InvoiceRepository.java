package com.tourapp.payment.repository;

import com.tourapp.payment.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByPaymentId(Long paymentId);
}
