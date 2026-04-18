package com.used30.backend.dto.product;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {

    private UUID id;
    private UUID sellerId;
    private String sellerEmail;
    private String sellerNickname;
    private String artistName;
    private String albumName;
    private String label;
    private String country;
    private short releaseYear;
    private String pressing;
    private String catalogNumber;
    private String format;
    private short rpm;
    private String mediaGrade;
    private String sleeveGrade;
    private boolean hasInsert;
    private boolean hasObiStrip;
    private String description;
    private int askingPrice;
    private Integer finalPrice;
    private String status;
    private boolean guaranteed;
    private String sampleYoutubeId;
    private String coverBg;
    private String coverAccent;
    private List<String> genres;
    private OffsetDateTime listedAt;
    private OffsetDateTime soldAt;
    private OffsetDateTime createdAt;
}
