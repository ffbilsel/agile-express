package com.ffb.be.model.exception.common;

import com.ffb.be.model.exception.CustomException;

public class EntityNotFoundException extends CustomException {

    public EntityNotFoundException(String type, Object load) {
        super("Entity not found with type: " + type + " and load: " + load);
    }

}
