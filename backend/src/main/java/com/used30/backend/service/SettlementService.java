package com.used30.backend.service;

import com.used30.backend.domain.settlement.SettlementStatus;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.settlement.SettlementDetailResponse;
import com.used30.backend.dto.settlement.SettlementListItem;
import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import java.math.BigDecimal;
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
public class SettlementService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PageResponse<SettlementListItem> search(SettlementStatus status,
                                                   OffsetDateTime startDate,
                                                   OffsetDateTime endDate,
                                                   String search,
                                                   Pageable pageable) {
        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("limit", pageable.getPageSize())
            .addValue("offset", pageable.getOffset());

        if (status != null) {
            if (status == SettlementStatus.pending) {
                where.append(" AND s.status IN ('pending', 'scheduled') ");
            } else if (status == SettlementStatus.completed) {
                where.append(" AND s.status IN ('completed', 'processed') ");
            } else {
                where.append(" AND s.status = :status ");
                params.addValue("status", status.name());
            }
        }
        if (startDate != null) {
            where.append(" AND s.created_at >= :startDate ");
            params.addValue("startDate", startDate);
        }
        if (endDate != null) {
            where.append(" AND s.created_at <= :endDate ");
            params.addValue("endDate", endDate);
        }
        if (search != null && !search.isBlank()) {
            where.append(" AND (LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) ");
            where.append(" OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :search, '%'))) ");
            params.addValue("search", search);
        }

        List<SettlementListItem> content = jdbcTemplate.query("""
            SELECT s.id,
                   s.seller_id,
                   u.email AS seller_email,
                   u.nickname AS seller_nickname,
                   s.product_price AS sale_price,
                   (s.seller_fee + s.inspection_fee) AS fee_amount,
                   s.settlement_amount AS net_amount,
                   CASE
                     WHEN s.status = 'scheduled' THEN 'pending'
                     WHEN s.status = 'processed' THEN 'completed'
                     ELSE s.status
                   END AS status,
                   'manual_confirm' AS trigger,
                   s.created_at
            FROM settlements s
            JOIN users u ON u.id = s.seller_id
            """ + where + """
            ORDER BY s.created_at DESC
            LIMIT :limit OFFSET :offset
            """, params, settlementListItemRowMapper());

        long total = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM settlements s
            JOIN users u ON u.id = s.seller_id
            """ + where, params, Long.class);

        return PageResponse.<SettlementListItem>builder()
            .content(content)
            .page(pageable.getPageNumber())
            .size(pageable.getPageSize())
            .totalElements(total)
            .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
            .build();
    }

    public SettlementDetailResponse get(UUID id) {
        List<SettlementDetailResponse> results = jdbcTemplate.query("""
            SELECT s.id,
                   s.order_id,
                   s.seller_id,
                   u.email AS seller_email,
                   u.nickname AS seller_nickname,
                   s.bank_account_id,
                   s.product_price AS sale_price,
                   CASE
                     WHEN s.product_price > 0
                     THEN ROUND(((s.seller_fee + s.inspection_fee)::numeric / s.product_price::numeric) * 100, 2)
                     ELSE 0
                   END AS fee_rate,
                   (s.seller_fee + s.inspection_fee) AS fee_amount,
                   s.settlement_amount AS net_amount,
                   CASE
                     WHEN s.status = 'scheduled' THEN 'pending'
                     WHEN s.status = 'processed' THEN 'completed'
                     ELSE s.status
                   END AS status,
                   'manual_confirm' AS trigger,
                   s.processed_at AS settled_at,
                   NULL::text AS pg_transfer_id,
                   s.fail_reason AS failed_reason,
                   s.created_at
            FROM settlements s
            JOIN users u ON u.id = s.seller_id
            WHERE s.id = :id
            """, new MapSqlParameterSource("id", id), settlementDetailRowMapper());
        if (results.isEmpty()) {
            throw new BusinessException(ErrorCode.SETTLEMENT_NOT_FOUND);
        }
        return results.get(0);
    }

    @Transactional
    public SettlementDetailResponse process(UUID id) {
        int updated = jdbcTemplate.update("""
            UPDATE settlements
            SET status = 'completed',
                processed_at = NOW(),
                updated_at = NOW()
            WHERE id = :id
              AND status IN ('pending', 'scheduled')
            """, new MapSqlParameterSource("id", id));
        if (updated == 0) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "Settlement is not pending");
        }
        return get(id);
    }

    private RowMapper<SettlementListItem> settlementListItemRowMapper() {
        return (rs, rowNum) -> SettlementListItem.builder()
            .id((UUID) rs.getObject("id"))
            .sellerId((UUID) rs.getObject("seller_id"))
            .sellerEmail(rs.getString("seller_email"))
            .sellerNickname(rs.getString("seller_nickname"))
            .salePrice(rs.getInt("sale_price"))
            .feeAmount(rs.getInt("fee_amount"))
            .netAmount(rs.getInt("net_amount"))
            .status(rs.getString("status"))
            .trigger(rs.getString("trigger"))
            .createdAt(rs.getObject("created_at", OffsetDateTime.class))
            .build();
    }

    private RowMapper<SettlementDetailResponse> settlementDetailRowMapper() {
        return (rs, rowNum) -> SettlementDetailResponse.builder()
            .id((UUID) rs.getObject("id"))
            .orderId((UUID) rs.getObject("order_id"))
            .sellerId((UUID) rs.getObject("seller_id"))
            .sellerEmail(rs.getString("seller_email"))
            .sellerNickname(rs.getString("seller_nickname"))
            .bankAccountId((UUID) rs.getObject("bank_account_id"))
            .salePrice(rs.getInt("sale_price"))
            .feeRate(rs.getBigDecimal("fee_rate") == null ? BigDecimal.ZERO : rs.getBigDecimal("fee_rate"))
            .feeAmount(rs.getInt("fee_amount"))
            .netAmount(rs.getInt("net_amount"))
            .status(rs.getString("status"))
            .trigger(rs.getString("trigger"))
            .settledAt(rs.getObject("settled_at", OffsetDateTime.class))
            .pgTransferId(rs.getString("pg_transfer_id"))
            .failedReason(rs.getString("failed_reason"))
            .createdAt(rs.getObject("created_at", OffsetDateTime.class))
            .build();
    }
}
