package com.used30.backend.service;

import com.used30.backend.domain.inspection.InspectionResult;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.inspection.InspectionApproveRequest;
import com.used30.backend.dto.inspection.InspectionDetailResponse;
import com.used30.backend.dto.inspection.InspectionGradeMismatchRequest;
import com.used30.backend.dto.inspection.InspectionListItem;
import com.used30.backend.dto.inspection.InspectionRejectRequest;
import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InspectionService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PageResponse<InspectionListItem> search(InspectionResult result,
                                                   OffsetDateTime startDate,
                                                   OffsetDateTime endDate,
                                                   String search,
                                                   Pageable pageable) {
        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("limit", pageable.getPageSize())
            .addValue("offset", pageable.getOffset());

        if (result != null) {
            where.append(" AND i.status = :result ");
            params.addValue("result", result.name());
        }
        if (startDate != null) {
            where.append(" AND i.created_at >= :startDate ");
            params.addValue("startDate", startDate);
        }
        if (endDate != null) {
            where.append(" AND i.created_at <= :endDate ");
            params.addValue("endDate", endDate);
        }
        if (search != null && !search.isBlank()) {
            where.append(" AND (LOWER(c.artist) LIKE LOWER(CONCAT('%', :search, '%')) ");
            where.append(" OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))) ");
            params.addValue("search", search);
        }

        List<InspectionListItem> content = jdbcTemplate.query("""
            SELECT i.id,
                   o.product_id,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   i.status AS result,
                   o.product_price AS original_price,
                   NULL::int AS adjusted_price,
                   i.created_at
            FROM inspections i
            JOIN orders o ON o.id = i.order_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            """ + where + """
            ORDER BY i.created_at DESC
            LIMIT :limit OFFSET :offset
            """, params, inspectionListItemRowMapper());

        long total = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM inspections i
            JOIN orders o ON o.id = i.order_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            """ + where, params, Long.class);

        return PageResponse.<InspectionListItem>builder()
            .content(content)
            .page(pageable.getPageNumber())
            .size(pageable.getPageSize())
            .totalElements(total)
            .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
            .build();
    }

    public InspectionDetailResponse get(UUID id) {
        List<InspectionDetailResponse> results = jdbcTemplate.query("""
            SELECT i.id,
                   o.product_id,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   i.status AS result,
                   p.media_condition AS seller_media_grade,
                   p.sleeve_condition AS seller_sleeve_grade,
                   i.actual_media_cond AS inspector_media_grade,
                   i.actual_sleeve_cond AS inspector_sleeve_grade,
                   i.mismatch_reason AS rejection_reason,
                   i.mismatch_reason AS notes,
                   o.product_price AS original_price,
                   NULL::int AS adjusted_price,
                   NULL::text AS seller_response,
                   NULL::timestamptz AS seller_responded_at,
                   NULL::timestamptz AS response_deadline,
                   NULL::text AS rejection_action,
                   NULL::timestamptz AS rejection_actioned_at,
                   i.started_at AS received_at,
                   i.completed_at AS inspected_at,
                   i.created_at
            FROM inspections i
            JOIN orders o ON o.id = i.order_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            WHERE i.id = :id
            """, new MapSqlParameterSource("id", id), inspectionDetailRowMapper());
        if (results.isEmpty()) {
            throw new BusinessException(ErrorCode.INSPECTION_NOT_FOUND);
        }
        return results.get(0);
    }

    @Transactional
    public InspectionDetailResponse approve(UUID id, InspectionApproveRequest request) {
        ensurePendingInspection(id);
        jdbcTemplate.update("""
            UPDATE inspections
            SET status = 'approved',
                actual_media_cond = :mediaGrade,
                actual_sleeve_cond = :sleeveGrade,
                mismatch_reason = :notes,
                completed_at = NOW()
            WHERE id = :id
            """, new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("mediaGrade", request.getInspectorMediaGrade().name())
            .addValue("sleeveGrade", request.getInspectorSleeveGrade().name())
            .addValue("notes", request.getNotes()));
        return get(id);
    }

    @Transactional
    public InspectionDetailResponse gradeMismatch(UUID id, InspectionGradeMismatchRequest request) {
        ensurePendingInspection(id);
        String note = request.getNotes() == null || request.getNotes().isBlank()
            ? "Adjusted price: " + request.getAdjustedPrice()
            : request.getNotes() + " | Adjusted price: " + request.getAdjustedPrice();
        jdbcTemplate.update("""
            UPDATE inspections
            SET status = 'grade_mismatch',
                actual_media_cond = :mediaGrade,
                actual_sleeve_cond = :sleeveGrade,
                mismatch_reason = :notes,
                completed_at = NOW()
            WHERE id = :id
            """, new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("mediaGrade", request.getInspectorMediaGrade().name())
            .addValue("sleeveGrade", request.getInspectorSleeveGrade().name())
            .addValue("notes", note));
        return get(id);
    }

    @Transactional
    public InspectionDetailResponse reject(UUID id, InspectionRejectRequest request) {
        ensurePendingInspection(id);
        String note = request.getNotes() == null || request.getNotes().isBlank()
            ? request.getRejectionReason()
            : request.getRejectionReason() + " | " + request.getNotes();
        jdbcTemplate.update("""
            UPDATE inspections
            SET status = 'rejected',
                mismatch_reason = :note,
                completed_at = NOW()
            WHERE id = :id
            """, new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("note", note));
        return get(id);
    }

    private void ensurePendingInspection(UUID id) {
        String status = jdbcTemplate.query("""
            SELECT status
            FROM inspections
            WHERE id = :id
            """, new MapSqlParameterSource("id", id), rs -> rs.next() ? rs.getString("status") : null);
        if (status == null) {
            throw new BusinessException(ErrorCode.INSPECTION_NOT_FOUND);
        }
        if (!"pending".equals(status)) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "Inspection is not pending");
        }
    }

    private RowMapper<InspectionListItem> inspectionListItemRowMapper() {
        return (rs, rowNum) -> InspectionListItem.builder()
            .id((UUID) rs.getObject("id"))
            .productId((UUID) rs.getObject("product_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .result(rs.getString("result"))
            .originalPrice(rs.getInt("original_price"))
            .adjustedPrice((Integer) rs.getObject("adjusted_price"))
            .createdAt(rs.getObject("created_at", OffsetDateTime.class))
            .build();
    }

    private RowMapper<InspectionDetailResponse> inspectionDetailRowMapper() {
        return (rs, rowNum) -> InspectionDetailResponse.builder()
            .id((UUID) rs.getObject("id"))
            .productId((UUID) rs.getObject("product_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .result(rs.getString("result"))
            .sellerMediaGrade(rs.getString("seller_media_grade"))
            .sellerSleeveGrade(rs.getString("seller_sleeve_grade"))
            .inspectorMediaGrade(rs.getString("inspector_media_grade"))
            .inspectorSleeveGrade(rs.getString("inspector_sleeve_grade"))
            .rejectionReason(rs.getString("rejection_reason"))
            .notes(rs.getString("notes"))
            .originalPrice(rs.getInt("original_price"))
            .adjustedPrice((Integer) rs.getObject("adjusted_price"))
            .sellerResponse(rs.getString("seller_response"))
            .sellerRespondedAt(rs.getObject("seller_responded_at", OffsetDateTime.class))
            .responseDeadline(rs.getObject("response_deadline", OffsetDateTime.class))
            .rejectionAction(rs.getString("rejection_action"))
            .rejectionActionedAt(rs.getObject("rejection_actioned_at", OffsetDateTime.class))
            .receivedAt(rs.getObject("received_at", OffsetDateTime.class))
            .inspectedAt(rs.getObject("inspected_at", OffsetDateTime.class))
            .createdAt(rs.getObject("created_at", OffsetDateTime.class))
            .build();
    }
}
