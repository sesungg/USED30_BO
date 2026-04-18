package com.used30.backend.domain.product;

import com.used30.backend.domain.common.BaseTimeEntity;
import com.used30.backend.domain.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
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
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Product extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    @Column(name = "album_name", nullable = false)
    private String albumName;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "release_year", nullable = false)
    private short releaseYear;

    @Column(name = "pressing")
    private String pressing;

    @Column(name = "catalog_number")
    private String catalogNumber;

    @Column(name = "format", nullable = false, columnDefinition = "lp_format")
    private LpFormat format;

    @Column(name = "rpm", nullable = false)
    private short rpm;

    @Column(name = "media_grade", nullable = false, columnDefinition = "media_grade")
    private MediaGrade mediaGrade;

    @Column(name = "sleeve_grade", nullable = false, columnDefinition = "media_grade")
    private MediaGrade sleeveGrade;

    @Column(name = "has_insert", nullable = false)
    private boolean hasInsert;

    @Column(name = "has_obi_strip", nullable = false)
    private boolean hasObiStrip;

    @Column(name = "description")
    private String description;

    @Column(name = "asking_price", nullable = false)
    private int askingPrice;

    @Column(name = "final_price")
    private Integer finalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "product_status")
    private ProductStatus status;

    @Column(name = "is_guaranteed", nullable = false)
    private boolean isGuaranteed;

    @Column(name = "sample_youtube_id")
    private String sampleYoutubeId;

    @Column(name = "cover_bg", nullable = false)
    private String coverBg;

    @Column(name = "cover_accent", nullable = false)
    private String coverAccent;

    @Column(name = "listed_at")
    private OffsetDateTime listedAt;

    @Column(name = "sold_at")
    private OffsetDateTime soldAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "product_genres",
        joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "genre", columnDefinition = "genre")
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();
}