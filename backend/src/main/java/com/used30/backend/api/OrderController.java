package com.used30.backend.api;

import com.used30.backend.domain.order.OrderStatus;
import com.used30.backend.dto.ApiResponse;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.order.OrderDetailResponse;
import com.used30.backend.dto.order.OrderListItem;
import com.used30.backend.dto.order.ShippingInfoRequest;
import com.used30.backend.service.OrderService;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<PageResponse<OrderListItem>> list(
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
        @RequestParam(required = false) String search,
        Pageable pageable
    ) {
        return ApiResponse.ok(orderService.search(status, startDate, endDate, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(orderService.get(id));
    }

    @PostMapping("/{id}/shipping")
    public ApiResponse<OrderDetailResponse> registerShipping(
        @PathVariable UUID id,
        @Valid @RequestBody ShippingInfoRequest request
    ) {
        return ApiResponse.ok(orderService.registerShipping(id, request));
    }

    @PostMapping("/{id}/return/approve")
    public ApiResponse<OrderDetailResponse> approveReturn(@PathVariable UUID id) {
        return ApiResponse.ok(orderService.approveReturn(id));
    }

    @PostMapping("/{id}/return/reject")
    public ApiResponse<OrderDetailResponse> rejectReturn(@PathVariable UUID id) {
        return ApiResponse.ok(orderService.rejectReturn(id));
    }
}