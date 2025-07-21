package com.ffb.be.model.exception.common;

import com.ffb.be.model.exception.CustomException;

public class DuplicateDataException extends CustomException {

    public DuplicateDataException(String message) {
        super(message);
    }

}
