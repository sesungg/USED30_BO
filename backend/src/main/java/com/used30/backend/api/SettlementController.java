package com.used30.backend.api;

import com.used30.backend.domain.settlement.SettlementStatus;
import com.used30.backend.dto.ApiResponse;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.settlement.SettlementDetailResponse;
import com.used30.backend.dto.settlement.SettlementListItem;
import com.used30.backend.service.SettlementService;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping
    public ApiResponse<PageResponse<SettlementListItem>> list(
        @RequestParam(required = false) SettlementStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
        @RequestParam(required = false) String search,
        Pageable pageable
    ) {
        return ApiResponse.ok(settlementService.search(status, startDate, endDate, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<SettlementDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(settlementService.get(id));
    }

    @PostMapping("/{id}/process")
    public ApiResponse<SettlementDetailResponse> process(@PathVariable UUID id) {
        return ApiResponse.ok(settlementService.process(id));
    }
}