package com.used30.backend.dto.order;

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
public class OrderDetailResponse {

    private UUID id;
    private UUID buyerId;
    private String buyerEmail;
    private String buyerNickname;
    private UUID productId;
    private String artistName;
    private String albumName;
    private UUID inspectionId;
    private String status;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingAddress2;
    private String shippingZipcode;
    private OffsetDateTime deliveredAt;
    private OffsetDateTime confirmedAt;
    private OffsetDateTime autoConfirmAt;
    private OffsetDateTime createdAt;
}
