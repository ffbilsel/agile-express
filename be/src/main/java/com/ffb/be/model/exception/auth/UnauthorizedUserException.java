package com.ffb.be.model.exception.auth;

import com.ffb.be.model.exception.CustomException;

public class UnauthorizedUserException extends CustomException {

    public UnauthorizedUserException(String username, String action) {
        super("User " + username + " is not authorized for " + action);
    }

}

