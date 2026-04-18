package com.used30.backend.repository;

import com.used30.backend.domain.settlement.Settlement;
import com.used30.backend.domain.settlement.SettlementStatus;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettlementRepository extends JpaRepository<Settlement, UUID>, SettlementRepositoryCustom {

    long countByStatus(SettlementStatus status);
}