package com.used30.backend.repository;

import com.used30.backend.domain.product.Product;
import com.used30.backend.domain.product.ProductStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("""
        SELECT p FROM Product p
        WHERE (:status IS NULL OR p.status = :status)
          AND (:search IS NULL OR :search = ''
               OR LOWER(p.artistName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.albumName) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY p.createdAt DESC
    """)
    Page<Product> search(@Param("status") ProductStatus status,
                         @Param("search") String search,
                         Pageable pageable);

    long countByStatus(ProductStatus status);
}