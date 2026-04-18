package com.used30.backend.service;

import com.used30.backend.domain.user.User;
import com.used30.backend.dto.auth.LoginRequest;
import com.used30.backend.dto.auth.LoginResponse;
import com.used30.backend.dto.auth.RefreshTokenRequest;
import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import com.used30.backend.repository.UserRepository;
import com.used30.backend.security.JwtTokenProvider;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        User user = loadAdminByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String roleName = requireAdminRoleForLogin(user);

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), roleName);
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        return LoginResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .role(resolveResponseRole(user))
            .adminRole(user.getAdminRole() != null ? user.getAdminRole().name() : null)
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .accessTokenExpiresIn(jwtTokenProvider.getAccessTokenExpiry())
            .build();
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtTokenProvider.isRefreshToken(token)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
        UUID userId = jwtTokenProvider.getUserId(token);

        User user = loadAdminById(userId);
        String roleName = requireAdminRoleForRefresh(user);

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), roleName);
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        return LoginResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .role(resolveResponseRole(user))
            .adminRole(user.getAdminRole() != null ? user.getAdminRole().name() : null)
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .accessTokenExpiresIn(jwtTokenProvider.getAccessTokenExpiry())
            .build();
    }

    private User loadAdminByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        ensureActiveUser(user);
        return user;
    }

    private User loadAdminById(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        ensureActiveUser(user);
        return user;
    }

    private void ensureActiveUser(User user) {
        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Account is inactive");
        }
    }

    private String requireAdminRoleForLogin(User user) {
        if (user.getAdminRole() == null) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        return user.getAdminRole().name();
    }

    private String requireAdminRoleForRefresh(User user) {
        if (user.getAdminRole() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Admin access is not active");
        }
        return user.getAdminRole().name();
    }

    private String resolveResponseRole(User user) {
        if (user.getAdminRole() == null) {
            return user.getRole().name();
        }
        return user.getAdminRole() == com.used30.backend.domain.user.AdminRole.inspector
            ? com.used30.backend.domain.user.UserRole.inspector.name()
            : com.used30.backend.domain.user.UserRole.admin.name();
    }
}
