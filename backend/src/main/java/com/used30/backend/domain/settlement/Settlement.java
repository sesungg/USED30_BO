package com.used30.backend.domain.settlement;

import com.used30.backend.domain.common.BaseTimeEntity;
import com.used30.backend.domain.order.Order;
import com.used30.backend.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
@Table(name = "settlements")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Settlement extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "bank_account_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID bankAccountId;

    @Column(name = "sale_price", nullable = false)
    private int salePrice;

    @Column(name = "fee_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal feeRate;

    @Column(name = "fee_amount", nullable = false)
    private int feeAmount;

    @Column(name = "net_amount", nullable = false)
    private int netAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "settlement_status")
    private SettlementStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger", nullable = false, columnDefinition = "settlement_trigger")
    private SettlementTrigger trigger;

    @Column(name = "settled_at")
    private OffsetDateTime settledAt;

    @Column(name = "pg_transfer_id")
    private String pgTransferId;

    @Column(name = "failed_reason")
    private String failedReason;
}