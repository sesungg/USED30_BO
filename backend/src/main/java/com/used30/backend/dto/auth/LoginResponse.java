package com.used30.backend.dto.auth;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private UUID userId;
    private String email;
    private String nickname;
    private String role;
    private String adminRole;
    private String accessToken;
    private String refreshToken;
    private long accessTokenExpiresIn;
}