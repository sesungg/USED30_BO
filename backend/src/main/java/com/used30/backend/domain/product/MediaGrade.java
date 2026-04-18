package com.used30.backend.domain.product;

public enum MediaGrade {
    M,
    NM,
    VG_PLUS("VG+"),
    VG("VG"),
    G_PLUS("G+"),
    G("G"),
    F("F"),
    P("P");

    private final String dbValue;

    MediaGrade() {
        this.dbValue = name();
    }

    MediaGrade(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static MediaGrade fromDbValue(String value) {
        if (value == null) {
            return null;
        }
        for (MediaGrade g : values()) {
            if (g.dbValue.equals(value)) {
                return g;
            }
        }
        throw new IllegalArgumentException("Unknown media grade: " + value);
    }
}