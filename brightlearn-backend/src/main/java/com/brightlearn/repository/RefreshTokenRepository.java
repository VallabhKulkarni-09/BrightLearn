package com.brightlearn.repository;

import com.brightlearn.entity.RefreshToken;
import com.brightlearn.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);

    void deleteByUser(User user);
}
