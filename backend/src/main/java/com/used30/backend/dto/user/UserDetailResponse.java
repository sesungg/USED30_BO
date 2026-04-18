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
public class UserDetailResponse {

    private UUID id;
    private String email;
    private String nickname;
    private String phone;
    private boolean phoneVerified;
    private UserRole role;
    private AdminRole adminRole;
    private String profileBg;
    private BigDecimal mannerScore;
    private int salesCount;
    private int purchaseCount;
    private int wishCount;
    private boolean active;
    private OffsetDateTime createdAt;

    public static UserDetailResponse from(User user) {
        return UserDetailResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .phone(user.getPhone())
            .phoneVerified(user.isPhoneVerified())
            .role(user.getRole())
            .adminRole(user.getAdminRole())
            .profileBg(user.getProfileBg())
            .mannerScore(user.getMannerScore())
            .salesCount(user.getSalesCount())
            .purchaseCount(user.getPurchaseCount())
            .wishCount(user.getWishCount())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}