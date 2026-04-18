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
public class OrderListItem {

    private UUID id;
    private UUID buyerId;
    private String buyerEmail;
    private String buyerNickname;
    private UUID productId;
    private String artistName;
    private String albumName;
    private String status;
    private OffsetDateTime createdAt;
}
