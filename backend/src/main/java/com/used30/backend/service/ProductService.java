package com.used30.backend.service;

import com.used30.backend.domain.product.ProductStatus;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.product.ProductDetailResponse;
import com.used30.backend.dto.product.ProductListItem;
import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
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
public class ProductService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PageResponse<ProductListItem> search(ProductStatus status, String search, Pageable pageable) {
        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("limit", pageable.getPageSize())
            .addValue("offset", pageable.getOffset());

        if (status != null) {
            where.append(" AND p.status = :status ");
            params.addValue("status", status.name());
        }
        if (search != null && !search.isBlank()) {
            where.append(" AND (LOWER(c.artist) LIKE LOWER(CONCAT('%', :search, '%')) ");
            where.append(" OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))) ");
            params.addValue("search", search);
        }

        List<ProductListItem> content = jdbcTemplate.query("""
            SELECT p.id,
                   p.seller_id,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   p.price AS asking_price,
                   NULL::int AS final_price,
                   p.status,
                   p.created_at
            FROM products p
            JOIN lp_catalogs c ON c.id = p.catalog_id
            """ + where + """
            ORDER BY p.created_at DESC
            LIMIT :limit OFFSET :offset
            """, params, productListItemRowMapper());

        long total = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM products p
            JOIN lp_catalogs c ON c.id = p.catalog_id
            """ + where, params, Long.class);

        return PageResponse.<ProductListItem>builder()
            .content(content)
            .page(pageable.getPageNumber())
            .size(pageable.getPageSize())
            .totalElements(total)
            .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
            .build();
    }

    public ProductDetailResponse get(UUID id) {
        List<ProductDetailResponse> results = jdbcTemplate.query("""
            SELECT p.id,
                   p.seller_id,
                   u.email AS seller_email,
                   u.nickname AS seller_nickname,
                   c.artist AS artist_name,
                   c.title AS album_name,
                   COALESCE(c.label, '') AS label,
                   COALESCE(c.country, '') AS country,
                   COALESCE(c.release_year, 0) AS release_year,
                   NULL::text AS pressing,
                   NULL::text AS catalog_number,
                   COALESCE(c.format, 'LP') AS format,
                   33 AS rpm,
                   p.media_condition AS media_grade,
                   p.sleeve_condition AS sleeve_grade,
                   p.has_insert,
                   p.has_obi AS has_obi_strip,
                   p.description,
                   p.price AS asking_price,
                   NULL::int AS final_price,
                   p.status,
                   FALSE AS guaranteed,
                   NULL::text AS sample_youtube_id,
                   '#0050BE' AS cover_bg,
                   '#003E99' AS cover_accent,
                   ARRAY[]::text[] AS genres,
                   NULL::timestamptz AS listed_at,
                   NULL::timestamptz AS sold_at,
                   p.created_at
            FROM products p
            JOIN lp_catalogs c ON c.id = p.catalog_id
            JOIN users u ON u.id = p.seller_id
            WHERE p.id = :id
            """, new MapSqlParameterSource("id", id), (rs, rowNum) -> ProductDetailResponse.builder()
            .id((UUID) rs.getObject("id"))
            .sellerId((UUID) rs.getObject("seller_id"))
            .sellerEmail(rs.getString("seller_email"))
            .sellerNickname(rs.getString("seller_nickname"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .label(rs.getString("label"))
            .country(rs.getString("country"))
            .releaseYear((short) rs.getInt("release_year"))
            .pressing(rs.getString("pressing"))
            .catalogNumber(rs.getString("catalog_number"))
            .format(rs.getString("format"))
            .rpm((short) rs.getInt("rpm"))
            .mediaGrade(rs.getString("media_grade"))
            .sleeveGrade(rs.getString("sleeve_grade"))
            .hasInsert(rs.getBoolean("has_insert"))
            .hasObiStrip(rs.getBoolean("has_obi_strip"))
            .description(rs.getString("description"))
            .askingPrice(rs.getInt("asking_price"))
            .finalPrice((Integer) rs.getObject("final_price"))
            .status(rs.getString("status"))
            .guaranteed(rs.getBoolean("guaranteed"))
            .sampleYoutubeId(rs.getString("sample_youtube_id"))
            .coverBg(rs.getString("cover_bg"))
            .coverAccent(rs.getString("cover_accent"))
            .genres(List.of())
            .listedAt(null)
            .soldAt(null)
            .createdAt(rs.getObject("created_at", java.time.OffsetDateTime.class))
            .build());

        if (results.isEmpty()) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        return results.get(0);
    }

    private RowMapper<ProductListItem> productListItemRowMapper() {
        return (rs, rowNum) -> ProductListItem.builder()
            .id((UUID) rs.getObject("id"))
            .sellerId((UUID) rs.getObject("seller_id"))
            .artistName(rs.getString("artist_name"))
            .albumName(rs.getString("album_name"))
            .askingPrice(rs.getInt("asking_price"))
            .finalPrice((Integer) rs.getObject("final_price"))
            .status(rs.getString("status"))
            .createdAt(rs.getObject("created_at", java.time.OffsetDateTime.class))
            .build();
    }
}
