package com.used30.backend.repository;

import com.used30.backend.domain.settlement.Settlement;
import com.used30.backend.domain.settlement.SettlementStatus;
import java.time.OffsetDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SettlementRepositoryCustom {

    Page<Settlement> search(SettlementStatus status,
                            OffsetDateTime startDate,
                            OffsetDateTime endDate,
                            String search,
                            Pageable pageable);
}