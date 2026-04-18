package com.used30.backend.dto.product;

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
public class ProductListItem {

    private UUID id;
    private UUID sellerId;
    private String artistName;
    private String albumName;
    private int askingPrice;
    private Integer finalPrice;
    private String status;
    private OffsetDateTime createdAt;
}
