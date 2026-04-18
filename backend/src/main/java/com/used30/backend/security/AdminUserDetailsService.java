package com.used30.backend.security;

import com.used30.backend.domain.user.User;
import com.used30.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (!user.isActive()) {
            throw new UsernameNotFoundException("User is inactive: " + email);
        }

        if (user.getAdminRole() == null) {
            throw new UsernameNotFoundException("Admin account not found: " + email);
        }

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getId().toString())
            .password(user.getPasswordHash())
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getAdminRole().name())))
            .disabled(!user.isActive())
            .build();
    }
}
