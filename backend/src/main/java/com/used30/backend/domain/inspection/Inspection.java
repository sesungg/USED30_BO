package com.used30.backend.domain.inspection;

import com.used30.backend.domain.common.BaseTimeEntity;
import com.used30.backend.domain.product.MediaGrade;
import com.used30.backend.domain.product.Product;
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
@Table(name = "inspections")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Inspection extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id")
    private User inspector;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, columnDefinition = "inspection_result")
    private InspectionResult result;

    @Column(name = "seller_media_grade", nullable = false, columnDefinition = "media_grade")
    private MediaGrade sellerMediaGrade;

    @Column(name = "seller_sleeve_grade", nullable = false, columnDefinition = "media_grade")
    private MediaGrade sellerSleeveGrade;

    @Column(name = "inspector_media_grade", columnDefinition = "media_grade")
    private MediaGrade inspectorMediaGrade;

    @Column(name = "inspector_sleeve_grade", columnDefinition = "media_grade")
    private MediaGrade inspectorSleeveGrade;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "notes")
    private String notes;

    @Column(name = "original_price", nullable = false)
    private int originalPrice;

    @Column(name = "adjusted_price")
    private Integer adjustedPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "seller_response", columnDefinition = "seller_response")
    private SellerResponse sellerResponse;

    @Column(name = "seller_responded_at")
    private OffsetDateTime sellerRespondedAt;

    @Column(name = "response_deadline")
    private OffsetDateTime responseDeadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "rejection_action", columnDefinition = "rejection_action")
    private RejectionAction rejectionAction;

    @Column(name = "rejection_actioned_at")
    private OffsetDateTime rejectionActionedAt;

    @Column(name = "received_at")
    private OffsetDateTime receivedAt;

    @Column(name = "inspected_at")
    private OffsetDateTime inspectedAt;
}