package com.used30.backend.dto.settlement;

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
public class SettlementListItem {

    private UUID id;
    private UUID sellerId;
    private String sellerEmail;
    private String sellerNickname;
    private int salePrice;
    private int feeAmount;
    private int netAmount;
    private String status;
    private String trigger;
    private OffsetDateTime createdAt;
}
