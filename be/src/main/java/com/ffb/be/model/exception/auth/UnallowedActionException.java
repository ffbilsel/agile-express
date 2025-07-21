package com.ffb.be.model.exception.auth;

import com.ffb.be.model.exception.CustomException;

public class UnallowedActionException extends CustomException {

    public UnallowedActionException(String action) {
        super(action);
    }

}