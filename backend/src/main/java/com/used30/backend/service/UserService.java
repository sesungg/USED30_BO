package com.used30.backend.service;

import com.used30.backend.domain.user.User;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.user.BanUserRequest;
import com.used30.backend.dto.user.MannerScoreUpdateRequest;
import com.used30.backend.dto.user.UserDetailResponse;
import com.used30.backend.dto.user.UserListItem;
import com.used30.backend.exception.BusinessException;
import com.used30.backend.exception.ErrorCode;
import com.used30.backend.repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public PageResponse<UserListItem> search(String search, Pageable pageable) {
        return PageResponse.from(
            userRepository.search(search, pageable).map(UserListItem::from)
        );
    }

    public UserDetailResponse get(UUID id) {
        return UserDetailResponse.from(loadUser(id));
    }

    @Transactional
    public UserDetailResponse updateMannerScore(UUID id, MannerScoreUpdateRequest request) {
        User user = loadUser(id);
        user.setMannerScore(request.getMannerScore());
        return UserDetailResponse.from(user);
    }

    @Transactional
    public UserDetailResponse ban(UUID id, BanUserRequest request) {
        User user = loadUser(id);
        user.setActive(false);
        return UserDetailResponse.from(user);
    }

    @Transactional
    public UserDetailResponse activate(UUID id) {
        User user = loadUser(id);
        user.setActive(true);
        return UserDetailResponse.from(user);
    }

    private User loadUser(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}