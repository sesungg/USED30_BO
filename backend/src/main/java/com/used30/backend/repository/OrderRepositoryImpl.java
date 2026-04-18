package com.used30.backend.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.used30.backend.domain.order.Order;
import com.used30.backend.domain.order.OrderStatus;
import com.used30.backend.domain.order.QOrder;
import com.used30.backend.domain.product.QProduct;
import com.used30.backend.domain.user.QUser;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@RequiredArgsConstructor
public class OrderRepositoryImpl implements OrderRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Order> search(OrderStatus status,
                              OffsetDateTime startDate,
                              OffsetDateTime endDate,
                              String search,
                              Pageable pageable) {
        QOrder o = QOrder.order;
        QProduct p = QProduct.product;
        QUser u = QUser.user;

        BooleanBuilder where = new BooleanBuilder();
        if (status != null) {
            where.and(o.status.eq(status));
        }
        if (startDate != null) {
            where.and(o.createdAt.goe(startDate));
        }
        if (endDate != null) {
            where.and(o.createdAt.loe(endDate));
        }
        if (search != null && !search.isBlank()) {
            where.and(
                p.artistName.containsIgnoreCase(search)
                    .or(p.albumName.containsIgnoreCase(search))
                    .or(u.email.containsIgnoreCase(search))
                    .or(u.nickname.containsIgnoreCase(search))
            );
        }

        List<Order> content = queryFactory
            .selectFrom(o)
            .leftJoin(o.product, p).fetchJoin()
            .leftJoin(o.buyer, u).fetchJoin()
            .where(where)
            .orderBy(o.createdAt.desc())
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        Long total = queryFactory
            .select(o.count())
            .from(o)
            .leftJoin(o.product, p)
            .leftJoin(o.buyer, u)
            .where(where)
            .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }

    @Override
    public List<Order> findRecentOrdered(int limit) {
        QOrder o = QOrder.order;
        return queryFactory
            .selectFrom(o)
            .leftJoin(o.product).fetchJoin()
            .leftJoin(o.buyer).fetchJoin()
            .orderBy(o.createdAt.desc())
            .limit(limit)
            .fetch();
    }
}