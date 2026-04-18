package com.used30.backend.repository;

import com.used30.backend.domain.order.Order;
import com.used30.backend.domain.order.OrderStatus;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, UUID>, OrderRepositoryCustom {

    long countByStatus(OrderStatus status);

    long countByStatusIn(java.util.Collection<OrderStatus> statuses);
}