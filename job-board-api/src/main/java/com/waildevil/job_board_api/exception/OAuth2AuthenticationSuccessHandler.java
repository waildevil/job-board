package com.waildevil.job_board_api.exception;

import com.waildevil.job_board_api.entity.AuthProvider;
import com.waildevil.job_board_api.entity.Role;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.repository.UserRepository;
import com.waildevil.job_board_api.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepo;
    private final JwtService jwtService;

    @Value("${app.oauth2.frontend-redirect:http://localhost:3000/oauth2/callback}")
    private String frontendRedirect;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub"); // Google’s unique ID

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not available from provider");
            return;
        }

        User user = userRepo.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setName(name != null ? name : email);
            u.setRole(Role.CANDIDATE);
            u.setPassword("{noop}");
            u.setProvider(AuthProvider.GOOGLE);
            u.setProviderId(providerId);
            return userRepo.save(u);
        });

        // If existing account but no provider linked yet
        if (user.getProvider() == null) {
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
            userRepo.save(user);
        }

        // Generate JWT
        String jwt = jwtService.generateToken(user);

        // Redirect to frontend with JWT
        String redirectUrl = frontendRedirect + "#token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
