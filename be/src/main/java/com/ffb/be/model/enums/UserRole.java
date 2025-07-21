package com.ffb.be.model.enums;

import lombok.Getter;

@Getter
public enum UserRole {

    ADMIN("ROLE_ADMIN"),
    PROJECT_MANAGER("ROLE_PROJECT_MANAGER"),
    TEAM_LEAD("ROLE_TEAM_LEAD"),
    TEAM_MEMBER("ROLE_TEAM_MEMBER");

    private final String roleName;

    UserRole(String roleName) {
        this.roleName = roleName;
    }

    public static UserRole from(String value) {
        for (UserRole r : values()) {
            if (r.roleName.equalsIgnoreCase(value)               // "ROLE_ADMIN"
                    || r.name().equalsIgnoreCase(value)              // "ADMIN"
                    || ("ROLE_" + r.name()).equalsIgnoreCase(value)  // "ROLE_ADMIN" from "ADMIN"
            ) {
                return r;
            }
        }
        return TEAM_MEMBER;
    }

}
