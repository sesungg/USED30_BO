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
public class InspectionDetailResponse {

    private UUID id;
    private UUID productId;
    private String artistName;
    private String albumName;
    private String result;
    private String sellerMediaGrade;
    private String sellerSleeveGrade;
    private String inspectorMediaGrade;
    private String inspectorSleeveGrade;
    private String rejectionReason;
    private String notes;
    private int originalPrice;
    private Integer adjustedPrice;
    private String sellerResponse;
    private OffsetDateTime sellerRespondedAt;
    private OffsetDateTime responseDeadline;
    private String rejectionAction;
    private OffsetDateTime rejectionActionedAt;
    private OffsetDateTime receivedAt;
    private OffsetDateTime inspectedAt;
    private OffsetDateTime createdAt;
}
