package com.used30.backend.repository;

import com.used30.backend.domain.user.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByNickname(String nickname);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY u.createdAt DESC
    """)
    Page<User> search(@Param("search") String search, Pageable pageable);
}