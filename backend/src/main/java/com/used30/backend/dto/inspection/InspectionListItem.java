package com.used30.backend.dto.inspection;

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
public class InspectionListItem {

    private UUID id;
    private UUID productId;
    private String artistName;
    private String albumName;
    private String result;
    private int originalPrice;
    private Integer adjustedPrice;
    private OffsetDateTime createdAt;
}
