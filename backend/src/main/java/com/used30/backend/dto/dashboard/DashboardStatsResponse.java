package com.used30.backend.dto.dashboard;

import com.used30.backend.dto.inspection.InspectionListItem;
import com.used30.backend.dto.order.OrderListItem;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long todayInspectionPending;
    private long activeOrders;
    private long pendingSettlements;
    private long activeProducts;
    private List<InspectionListItem> urgentInspections;
    private List<OrderListItem> recentOrders;
}