package com.ffb.be.security;

import com.ffb.be.model.entity.User;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.repository.jpa.UserRepository;
import com.ffb.be.security.jwt.JwtUtils;
import com.ffb.be.service.helper.LdapService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final LdapService ldapService;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String email = oauthToken.getPrincipal().getAttribute("email");

        // Create user if not exists
        if (!ldapService.userExists(email)) {
            ldapService.createUserWithDefaultRole(email);

            User user = new User();
            user.setUsername(email);
            user.setRole(UserRole.TEAM_MEMBER);
            userRepository.save(user);
        }

        String role = ldapService.getRoleForUsername(email);
        if (role == null) {
            role = "ROLE_TEAM_MEMBER";
        }

        // Generate JWT tokens
        String accessToken = jwtUtils.generateJwtToken(email, List.of(role));
        String refreshToken = jwtUtils.generateRefreshToken(email);

        // Respond with HTML + postMessage to frontend
        response.setContentType("text/html;charset=UTF-8");
        String html = """
            <html>
              <body>
                <script>
                  window.opener.postMessage({
                    type: 'oauth2_success',
                    data: {
                      accessToken: '%s',
                      refreshToken: '%s',
                      username: '%s',
                      role: '%s'
                    }
                  }, 'http://localhost:3000');
                  window.close();
                </script>
              </body>
            </html>
            """.formatted(
                accessToken,
                refreshToken,
                email,
                role
        );
        response.getWriter().write(html);
    }

}