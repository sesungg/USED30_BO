package com.used30.backend.repository;

import com.used30.backend.domain.inspection.Inspection;
import com.used30.backend.domain.inspection.InspectionResult;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, UUID>, InspectionRepositoryCustom {

    long countByResult(InspectionResult result);
}