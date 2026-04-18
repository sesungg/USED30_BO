package com.used30.backend.security;

import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    public JwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.access-token-expiry}") long accessTokenExpiry,
        @Value("${jwt.refresh-token-expiry}") long refreshTokenExpiry
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }

    public String createAccessToken(UUID userId, String role) {
        return buildToken(userId, role, accessTokenExpiry, "access");
    }

    public String createRefreshToken(UUID userId) {
        return buildToken(userId, null, refreshTokenExpiry, "refresh");
    }

    private String buildToken(UUID userId, String role, long expiryMs, String type) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);
        var builder = Jwts.builder()
            .subject(userId.toString())
            .issuedAt(now)
            .expiration(expiry)
            .claim("type", type);
        if (role != null) {
            builder.claim("role", role);
        }
        return builder.signWith(secretKey).compact();
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String getRole(String token) {
        Object r = parseClaims(token).get("role");
        return r == null ? null : r.toString();
    }

    public boolean isAccessToken(String token) {
        Object t = parseClaims(token).get("type");
        return "access".equals(t);
    }

    public boolean isRefreshToken(String token) {
        Object t = parseClaims(token).get("type");
        return "refresh".equals(t);
    }

    public long getAccessTokenExpiry() {
        return accessTokenExpiry;
    }

    public long getRefreshTokenExpiry() {
        return refreshTokenExpiry;
    }
}