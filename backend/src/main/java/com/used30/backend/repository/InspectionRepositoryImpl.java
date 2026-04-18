package com.used30.backend.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.used30.backend.domain.inspection.Inspection;
import com.used30.backend.domain.inspection.InspectionResult;
import com.used30.backend.domain.inspection.QInspection;
import com.used30.backend.domain.product.QProduct;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@RequiredArgsConstructor
public class InspectionRepositoryImpl implements InspectionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Inspection> search(InspectionResult result,
                                   OffsetDateTime startDate,
                                   OffsetDateTime endDate,
                                   String search,
                                   Pageable pageable) {
        QInspection i = QInspection.inspection;
        QProduct p = QProduct.product;

        BooleanBuilder where = new BooleanBuilder();
        if (result != null) {
            where.and(i.result.eq(result));
        }
        if (startDate != null) {
            where.and(i.createdAt.goe(startDate));
        }
        if (endDate != null) {
            where.and(i.createdAt.loe(endDate));
        }
        if (search != null && !search.isBlank()) {
            where.and(
                p.artistName.containsIgnoreCase(search)
                    .or(p.albumName.containsIgnoreCase(search))
            );
        }

        List<Inspection> content = queryFactory
            .selectFrom(i)
            .leftJoin(i.product, p).fetchJoin()
            .where(where)
            .orderBy(i.createdAt.desc())
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        Long total = queryFactory
            .select(i.count())
            .from(i)
            .leftJoin(i.product, p)
            .where(where)
            .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }

    @Override
    public List<Inspection> findTopPendingOrdered(int limit) {
        QInspection i = QInspection.inspection;
        return queryFactory
            .selectFrom(i)
            .leftJoin(i.product).fetchJoin()
            .where(i.result.eq(InspectionResult.pending))
            .orderBy(i.createdAt.asc())
            .limit(limit)
            .fetch();
    }
}