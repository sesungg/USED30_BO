package com.used30.backend.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid email or password"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid or expired token"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "You do not have permission to access this resource"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Validation failed"),
    INVALID_STATE(HttpStatus.BAD_REQUEST, "Invalid state for this operation"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Product not found"),
    INSPECTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Inspection not found"),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Order not found"),
    SETTLEMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Settlement not found"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}