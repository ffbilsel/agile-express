package com.ffb.be;

import com.ffb.be.model.entity.User;
import com.ffb.be.model.enums.UserRole;
import com.ffb.be.repository.jpa.UserRepository;
import com.ffb.be.service.helper.LdapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.filter.EqualsFilter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class LdapUserSyncRunner implements CommandLineRunner {

    @Value("${app.sync-ldap-users:false}")
    private boolean ENABLE_LDAP_SYNC;

    private final LdapTemplate ldapTemplate;
    private final UserRepository userRepository;
    private final LdapService ldapService;  // Inject your LdapService here

    private static final String BASE_DN_USERS = "ou=users";

    @Override
    public void run(String... args) {
        if (!ENABLE_LDAP_SYNC) {
            log.info("LDAP user sync is disabled.");
            return;
        }

        log.info("Starting LDAP user sync...");

        List<String> ldapUsernames = ldapTemplate.search(
                BASE_DN_USERS,
                new EqualsFilter("objectClass", "inetOrgPerson").encode(),
                (AttributesMapper<String>) attrs -> {
                    var cnAttr = attrs.get("cn");
                    return cnAttr != null ? cnAttr.get().toString() : null;
                }
        ).stream().filter(Objects::nonNull).toList();

        List<User> users = new ArrayList<>();
        for (String username : ldapUsernames) {
            String role = ldapService.getRoleForUsername(username);

            User user = userRepository.findById(username).orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername(username);
                return newUser;
            });

            user.setRole(UserRole.from(role));

            users.add(user);
        }
        userRepository.saveAll(users);
        log.info("LDAP user sync complete.");
    }

}
