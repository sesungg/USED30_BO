package com.used30.backend.dto.settlement;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementDetailResponse {

    private UUID id;
    private UUID orderId;
    private UUID sellerId;
    private String sellerEmail;
    private String sellerNickname;
    private UUID bankAccountId;
    private int salePrice;
    private BigDecimal feeRate;
    private int feeAmount;
    private int netAmount;
    private String status;
    private String trigger;
    private OffsetDateTime settledAt;
    private String pgTransferId;
    private String failedReason;
    private OffsetDateTime createdAt;
}
