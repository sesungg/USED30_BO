package com.used30.backend.repository;

import com.used30.backend.domain.inspection.Inspection;
import com.used30.backend.domain.inspection.InspectionResult;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InspectionRepositoryCustom {

    Page<Inspection> search(InspectionResult result,
                            OffsetDateTime startDate,
                            OffsetDateTime endDate,
                            String search,
                            Pageable pageable);

    List<Inspection> findTopPendingOrdered(int limit);
}