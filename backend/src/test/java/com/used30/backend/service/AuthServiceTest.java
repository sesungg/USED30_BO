package com.used30.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.used30.backend.domain.user.User;
import com.used30.backend.domain.user.UserRole;
import com.used30.backend.dto.auth.LoginRequest;
import com.used30.backend.dto.auth.LoginResponse;
import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import com.used30.backend.repository.UserRepository;
import com.used30.backend.security.JwtTokenProvider;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginReturnsTokensForActiveAdminAccount() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
            .id(userId)
            .email("admin@used30.com")
            .passwordHash("encoded-password")
            .nickname("admin")
            .role(UserRole.admin)
            .adminRoleCode("admin")
            .mannerScore(BigDecimal.valueOf(36.5))
            .isActive(true)
            .build();
        LoginRequest request = new LoginRequest("admin@used30.com", "password123");

        given(userRepository.findByEmail("admin@used30.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password123", "encoded-password")).willReturn(true);
        given(jwtTokenProvider.createAccessToken(userId, "admin")).willReturn("access-token");
        given(jwtTokenProvider.createRefreshToken(userId)).willReturn("refresh-token");
        given(jwtTokenProvider.getAccessTokenExpiry()).willReturn(3600000L);

        LoginResponse response = authService.login(request);

        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getEmail()).isEqualTo("admin@used30.com");
        assertThat(response.getRole()).isEqualTo("admin");
        assertThat(response.getAdminRole()).isEqualTo("admin");
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
    }

    @Test
    void loginRejectsUserWithoutAdminRole() {
        User user = User.builder()
            .id(UUID.randomUUID())
            .email("user@used30.com")
            .passwordHash("encoded-password")
            .nickname("user")
            .role(UserRole.user)
            .mannerScore(BigDecimal.valueOf(36.5))
            .isActive(true)
            .build();
        LoginRequest request = new LoginRequest("user@used30.com", "password123");

        given(userRepository.findByEmail("user@used30.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password123", "encoded-password")).willReturn(true);

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(BusinessException.class)
            .extracting(ex -> ((BusinessException) ex).getErrorCode())
            .isEqualTo(ErrorCode.INVALID_CREDENTIALS);
    }
}
