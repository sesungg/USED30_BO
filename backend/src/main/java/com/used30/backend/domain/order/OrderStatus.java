package com.used30.backend.domain.order;

public enum OrderStatus {
    payment_complete,
    inspection_pending,
    inspection_pass,
    inspection_grade_mismatch,
    inspection_rejected,
    shipping,
    delivered,
    confirmed,
    auto_confirmed,
    return_requested,
    refunded,
    cancelled
}