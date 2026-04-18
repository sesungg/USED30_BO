package com.used30.backend.domain.user;

import com.used30.backend.domain.common.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class User extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "nickname", nullable = false, unique = true)
    private String nickname;

    @Column(name = "phone")
    private String phone;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Setter(AccessLevel.NONE)
    @Formula("""
        (
            SELECT aur.role_code
            FROM admin_user_roles aur
            JOIN admin_accounts aa ON aa.user_id = aur.user_id
            WHERE aur.user_id = id
              AND aur.revoked_at IS NULL
              AND aa.status = 'active'
            ORDER BY aur.is_primary DESC, aur.assigned_at ASC
            LIMIT 1
        )
        """)
    private String adminRoleCode;

    @Column(name = "profile_bg", nullable = false)
    private String profileBg;

    @Column(name = "manner_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal mannerScore;

    @Column(name = "sales_count", nullable = false)
    private int salesCount;

    @Column(name = "purchase_count", nullable = false)
    private int purchaseCount;

    @Column(name = "wish_count", nullable = false)
    private int wishCount;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    public AdminRole getAdminRole() {
        if (adminRoleCode == null || adminRoleCode.isBlank()) {
            return null;
        }
        try {
            return AdminRole.valueOf(adminRoleCode);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
