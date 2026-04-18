package com.used30.backend.domain.payment;

import com.used30.backend.domain.common.BaseTimeEntity;
import com.used30.backend.domain.order.Order;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Payment extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, columnDefinition = "payment_method")
    private PaymentMethod method;

    @Column(name = "amount", nullable = false)
    private int amount;

    @Column(name = "pg_provider", nullable = false)
    private String pgProvider;

    @Column(name = "pg_order_id", nullable = false, unique = true)
    private String pgOrderId;

    @Column(name = "pg_payment_key", unique = true)
    private String pgPaymentKey;

    @Column(name = "pg_raw_response", columnDefinition = "jsonb")
    private String pgRawResponse;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "payment_status")
    private PaymentStatus status;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "refund_amount")
    private Integer refundAmount;

    @Column(name = "refunded_at")
    private OffsetDateTime refundedAt;

    @Column(name = "failed_reason")
    private String failedReason;
}