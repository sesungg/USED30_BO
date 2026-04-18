package com.used30.backend.service;

import com.used30.backend.domain.order.OrderStatus;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.order.OrderDetailResponse;
import com.used30.backend.dto.order.OrderListItem;
import com.used30.backend.dto.order.ShippingInfoRequest;
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
public class OrderService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PageResponse<OrderListItem> search(OrderStatus status,
                                              OffsetDateTime startDate,
                                              OffsetDateTime endDate,
                                              String search,
                                              Pageable pageable) {
        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("limit", pageable.getPageSize())
            .addValue("offset", pageable.getOffset());

        if (status != null) {
            where.append(" AND o.status = :status ");
            params.addValue("status", status.name());
        }
        if (startDate != null) {
            where.append(" AND o.created_at >= :startDate ");
            params.addValue("startDate", startDate);
        }
        if (endDate != null) {
            where.append(" AND o.created_at <= :endDate ");
            params.addValue("endDate", endDate);
        }
        if (search != null && !search.isBlank()) {
            where.append(" AND (LOWER(c.artist) LIKE LOWER(CONCAT('%', :search, '%')) ");
            where.append(" OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) ");
            where.append(" OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) ");
            where.append(" OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :search, '%'))) ");
            params.addValue("search", search);
        }

        List<OrderListItem> content = jdbcTemplate.query("""
            SELECT o.id,
                   u.id AS buyer_id,
                   u.email AS buyer_email,
                   u.nickname AS buyer_nickname,
                   o.product_id,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   o.status,
                   o.created_at
            FROM orders o
            JOIN users u ON u.id = o.buyer_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            """ + where + """
            ORDER BY o.created_at DESC
            LIMIT :limit OFFSET :offset
            """, params, orderListItemRowMapper());

        long total = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM orders o
            JOIN users u ON u.id = o.buyer_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            """ + where, params, Long.class);

        return PageResponse.<OrderListItem>builder()
            .content(content)
            .page(pageable.getPageNumber())
            .size(pageable.getPageSize())
            .totalElements(total)
            .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
            .build();
    }

    public OrderDetailResponse get(UUID id) {
        List<OrderDetailResponse> results = jdbcTemplate.query("""
            SELECT o.id,
                   u.id AS buyer_id,
                   u.email AS buyer_email,
                   u.nickname AS buyer_nickname,
                   o.product_id,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   i.id AS inspection_id,
                   o.status,
                   a.recipient AS shipping_name,
                   a.phone AS shipping_phone,
                   a.address AS shipping_address,
                   a.address2 AS shipping_address2,
                   a.zipcode AS shipping_zipcode,
                   NULL::timestamptz AS delivered_at,
                   NULL::timestamptz AS confirmed_at,
                   NULL::timestamptz AS auto_confirm_at,
                   o.created_at
            FROM orders o
            JOIN users u ON u.id = o.buyer_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            LEFT JOIN user_addresses a ON a.id = o.shipping_address_id
            LEFT JOIN inspections i ON i.order_id = o.id
            WHERE o.id = :id
            """, new MapSqlParameterSource("id", id), orderDetailRowMapper());
        if (results.isEmpty()) {
            throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
        }
        return results.get(0);
    }

    @Transactional
    public OrderDetailResponse registerShipping(UUID id, ShippingInfoRequest request) {
        int updated = jdbcTemplate.update("""
            UPDATE orders
            SET tracking_no_to_buyer = :trackingNo,
                status = 'shipping',
                updated_at = NOW()
            WHERE id = :id
            """, new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("trackingNo", request.getTrackingNo()));
        if (updated == 0) {
            throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
        }
        return get(id);
    }

    @Transactional
    public OrderDetailResponse approveReturn(UUID id) {
        updateOrderStatus(id, "refunded");
        return get(id);
    }

    @Transactional
    public OrderDetailResponse rejectReturn(UUID id) {
        updateOrderStatus(id, "confirmed");
        return get(id);
    }

    private void updateOrderStatus(UUID id, String status) {
        int updated = jdbcTemplate.update("""
            UPDATE orders
            SET status = :status,
                updated_at = NOW()
            WHERE id = :id
            """, new MapSqlParameterSource()
            .addValue("id", id)
            .addValue("status", status));
        if (updated == 0) {
            throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
        }
    }

    private RowMapper<OrderListItem> orderListItemRowMapper() {
        return (rs, rowNum) -> OrderListItem.builder()
            .id((UUID) rs.getObject("id"))
            .buyerId((UUID) rs.getObject("buyer_id"))
            .buyerEmail(rs.getString("buyer_email"))
            .buyerNickname(rs.getString("buyer_nickname"))
            .productId((UUID) rs.getObject("product_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .status(rs.getString("status"))
            .createdAt(rs.getObject("created_at", OffsetDateTime.class))
            .build();
    }

    private RowMapper<OrderDetailResponse> orderDetailRowMapper() {
        return (rs, rowNum) -> OrderDetailResponse.builder()
            .id((UUID) rs.getObject("id"))
            .buyerId((UUID) rs.getObject("buyer_id"))
            .buyerEmail(rs.getString("buyer_email"))
            .buyerNickname(rs.getString("buyer_nickname"))
            .productId((UUID) rs.getObject("product_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .inspectionId((UUID) rs.getObject("inspection_id"))
            .status(rs.getString("status"))
            .shippingName(rs.getString("shipping_name"))
            .shippingPhone(rs.getString("shipping_phone"))
            .shippingAddress(rs.getString("shipping_address"))
            .shippingAddress2(rs.getString("shipping_address2"))
            .shippingZipcode(rs.getString("shipping_zipcode"))
            .deliveredAt(rs.getObject("delivered_at", OffsetDateTime.class))
            .confirmedAt(rs.getObject("confirmed_at", OffsetDateTime.class))
            .autoConfirmAt(rs.getObject("auto_confirm_at", OffsetDateTime.class))
            .createdAt(rs.getObject("created_at", OffsetDateTime.class))
            .build();
    }
}
