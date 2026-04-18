package com.used30.backend.api;

import com.used30.backend.dto.ApiResponse;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.user.BanUserRequest;
import com.used30.backend.dto.user.MannerScoreUpdateRequest;
import com.used30.backend.dto.user.UserDetailResponse;
import com.used30.backend.dto.user.UserListItem;
import com.used30.backend.service.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<PageResponse<UserListItem>> list(
        @RequestParam(required = false) String search,
        Pageable pageable
    ) {
        return ApiResponse.ok(userService.search(search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(userService.get(id));
    }

    @PatchMapping("/{id}/manner-score")
    public ApiResponse<UserDetailResponse> updateMannerScore(
        @PathVariable UUID id,
        @Valid @RequestBody MannerScoreUpdateRequest request
    ) {
        return ApiResponse.ok(userService.updateMannerScore(id, request));
    }

    @PostMapping("/{id}/ban")
    public ApiResponse<UserDetailResponse> ban(
        @PathVariable UUID id,
        @Valid @RequestBody BanUserRequest request
    ) {
        return ApiResponse.ok(userService.ban(id, request));
    }

    @PostMapping("/{id}/activate")
    public ApiResponse<UserDetailResponse> activate(@PathVariable UUID id) {
        return ApiResponse.ok(userService.activate(id));
    }
}