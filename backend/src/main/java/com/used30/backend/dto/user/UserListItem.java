package com.used30.backend.dto.user;

import com.used30.backend.domain.user.AdminRole;
import com.used30.backend.domain.user.User;
import com.used30.backend.domain.user.UserRole;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListItem {

    private UUID id;
    private String email;
    private String nickname;
    private UserRole role;
    private AdminRole adminRole;
    private BigDecimal mannerScore;
    private int salesCount;
    private int purchaseCount;
    private boolean active;
    private OffsetDateTime createdAt;

    public static UserListItem from(User user) {
        return UserListItem.builder()
            .id(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .role(user.getRole())
            .adminRole(user.getAdminRole())
            .mannerScore(user.getMannerScore())
            .salesCount(user.getSalesCount())
            .purchaseCount(user.getPurchaseCount())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}