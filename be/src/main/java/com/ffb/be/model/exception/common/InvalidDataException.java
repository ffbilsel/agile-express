package com.ffb.be.model.exception.common;

import com.ffb.be.model.exception.CustomException;

public class InvalidDataException extends CustomException {

    public InvalidDataException(String message) {
        super(message);
    }

}