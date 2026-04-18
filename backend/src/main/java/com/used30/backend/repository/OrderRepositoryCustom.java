package com.used30.backend.repository;

import com.used30.backend.domain.order.Order;
import com.used30.backend.domain.order.OrderStatus;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderRepositoryCustom {

    Page<Order> search(OrderStatus status,
                       OffsetDateTime startDate,
                       OffsetDateTime endDate,
                       String search,
                       Pageable pageable);

    List<Order> findRecentOrdered(int limit);
}