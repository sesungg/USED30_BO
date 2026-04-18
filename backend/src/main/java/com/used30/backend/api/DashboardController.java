package com.used30.backend.api;

import com.used30.backend.dto.ApiResponse;
import com.used30.backend.dto.dashboard.DashboardStatsResponse;
import com.used30.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardStatsResponse> getStats() {
        return ApiResponse.ok(dashboardService.getStats());
    }
}