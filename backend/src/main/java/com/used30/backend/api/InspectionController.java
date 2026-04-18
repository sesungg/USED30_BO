package com.used30.backend.api;

import com.used30.backend.domain.inspection.InspectionResult;
import com.used30.backend.dto.ApiResponse;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.inspection.InspectionApproveRequest;
import com.used30.backend.dto.inspection.InspectionDetailResponse;
import com.used30.backend.dto.inspection.InspectionGradeMismatchRequest;
import com.used30.backend.dto.inspection.InspectionListItem;
import com.used30.backend.dto.inspection.InspectionRejectRequest;
import com.used30.backend.service.InspectionService;
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
@RequestMapping("/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping
    public ApiResponse<PageResponse<InspectionListItem>> list(
        @RequestParam(required = false) InspectionResult result,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
        @RequestParam(required = false) String search,
        Pageable pageable
    ) {
        return ApiResponse.ok(inspectionService.search(result, startDate, endDate, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<InspectionDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(inspectionService.get(id));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<InspectionDetailResponse> approve(
        @PathVariable UUID id,
        @Valid @RequestBody InspectionApproveRequest request
    ) {
        return ApiResponse.ok(inspectionService.approve(id, request));
    }

    @PostMapping("/{id}/grade-mismatch")
    public ApiResponse<InspectionDetailResponse> gradeMismatch(
        @PathVariable UUID id,
        @Valid @RequestBody InspectionGradeMismatchRequest request
    ) {
        return ApiResponse.ok(inspectionService.gradeMismatch(id, request));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<InspectionDetailResponse> reject(
        @PathVariable UUID id,
        @Valid @RequestBody InspectionRejectRequest request
    ) {
        return ApiResponse.ok(inspectionService.reject(id, request));
    }
}