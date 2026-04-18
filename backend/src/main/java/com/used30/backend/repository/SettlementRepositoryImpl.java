package com.used30.backend.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.used30.backend.domain.settlement.QSettlement;
import com.used30.backend.domain.settlement.Settlement;
import com.used30.backend.domain.settlement.SettlementStatus;
import com.used30.backend.domain.user.QUser;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@RequiredArgsConstructor
public class SettlementRepositoryImpl implements SettlementRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Settlement> search(SettlementStatus status,
                                   OffsetDateTime startDate,
                                   OffsetDateTime endDate,
                                   String search,
                                   Pageable pageable) {
        QSettlement s = QSettlement.settlement;
        QUser u = QUser.user;

        BooleanBuilder where = new BooleanBuilder();
        if (status != null) {
            where.and(s.status.eq(status));
        }
        if (startDate != null) {
            where.and(s.createdAt.goe(startDate));
        }
        if (endDate != null) {
            where.and(s.createdAt.loe(endDate));
        }
        if (search != null && !search.isBlank()) {
            where.and(
                u.email.containsIgnoreCase(search)
                    .or(u.nickname.containsIgnoreCase(search))
            );
        }

        List<Settlement> content = queryFactory
            .selectFrom(s)
            .leftJoin(s.seller, u).fetchJoin()
            .where(where)
            .orderBy(s.createdAt.desc())
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        Long total = queryFactory
            .select(s.count())
            .from(s)
            .leftJoin(s.seller, u)
            .where(where)
            .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }
}