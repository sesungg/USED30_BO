package com.used30.backend.domain.product;

public enum LpFormat {
    LP_1("1LP"),
    LP_2("2LP"),
    LP_3("3LP"),
    EP("EP"),
    INCH_7("7\""),
    INCH_10("10\""),
    INCH_12("12\"");

    private final String dbValue;

    LpFormat(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static LpFormat fromDbValue(String value) {
        if (value == null) {
            return null;
        }
        for (LpFormat f : values()) {
            if (f.dbValue.equals(value)) {
                return f;
            }
        }
        throw new IllegalArgumentException("Unknown lp format: " + value);
    }
}