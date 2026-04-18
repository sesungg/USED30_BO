package com.used30.backend.service;

import com.used30.backend.dto.dashboard.DashboardStatsResponse;
import com.used30.backend.dto.inspection.InspectionListItem;
import com.used30.backend.dto.order.OrderListItem;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public DashboardStatsResponse getStats() {
        long todayInspectionPending = count("SELECT COUNT(*) FROM inspections WHERE status = 'pending'");
        long activeOrders = count("SELECT COUNT(*) FROM orders WHERE status IN ('payment_complete', 'payment_pending', 'inspection_pending', 'inspection_pass', 'shipping', 'delivered')");
        long pendingSettlements = count("SELECT COUNT(*) FROM settlements WHERE status IN ('pending', 'scheduled')");
        long activeProducts = count("SELECT COUNT(*) FROM products WHERE status IN ('on_sale', 'inspection_pending')");

        List<InspectionListItem> urgentInspections = jdbcTemplate.query("""
            SELECT i.id,
                   o.product_id,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   CASE
                     WHEN i.status IN ('approved', 'inspection_pass') THEN 'approved'
                     WHEN i.status IN ('grade_mismatch', 'inspection_grade_mismatch') THEN 'grade_mismatch'
                     WHEN i.status IN ('rejected', 'inspection_rejected') THEN 'rejected'
                     ELSE 'pending'
                   END AS result,
                   o.product_price AS original_price,
                   NULL::int AS adjusted_price,
                   i.created_at
            FROM inspections i
            JOIN orders o ON o.id = i.order_id
            JOIN products p ON p.id = o.product_id
            JOIN lp_catalogs c ON c.id = p.catalog_id
            WHERE i.status = 'pending'
            ORDER BY i.created_at ASC
            LIMIT :limit
            """, new MapSqlParameterSource("limit", 5), (rs, rowNum) -> InspectionListItem.builder()
            .id((java.util.UUID) rs.getObject("id"))
            .productId((java.util.UUID) rs.getObject("product_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .result(rs.getString("result"))
            .originalPrice(rs.getInt("original_price"))
            .adjustedPrice((Integer) rs.getObject("adjusted_price"))
            .createdAt(rs.getObject("created_at", java.time.OffsetDateTime.class))
            .build());

        List<OrderListItem> recentOrders = jdbcTemplate.query("""
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
            ORDER BY o.created_at DESC
            LIMIT :limit
            """, new MapSqlParameterSource("limit", 10), (rs, rowNum) -> OrderListItem.builder()
            .id((java.util.UUID) rs.getObject("id"))
            .buyerId((java.util.UUID) rs.getObject("buyer_id"))
            .buyerEmail(rs.getString("buyer_email"))
            .buyerNickname(rs.getString("buyer_nickname"))
            .productId((java.util.UUID) rs.getObject("product_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .status(rs.getString("status"))
            .createdAt(rs.getObject("created_at", java.time.OffsetDateTime.class))
            .build());

        return DashboardStatsResponse.builder()
            .todayInspectionPending(todayInspectionPending)
            .activeOrders(activeOrders)
            .pendingSettlements(pendingSettlements)
            .activeProducts(activeProducts)
            .urgentInspections(urgentInspections)
            .recentOrders(recentOrders)
            .build();
    }

    private long count(String sql) {
        return jdbcTemplate.queryForObject(sql, Map.of(), Long.class);
    }
}
