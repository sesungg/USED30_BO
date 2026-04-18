package com.used30.backend.domain.product;

public enum Genre {
    JAZZ("JAZZ"),
    R_AND_B("R&B"),
    DISCO("DISCO"),
    SOUL("SOUL"),
    ROCK("ROCK"),
    CLASSICAL("CLASSICAL"),
    HIP_HOP("HIP-HOP"),
    FUNK("FUNK"),
    BLUES("BLUES"),
    POP("POP");

    private final String dbValue;

    Genre(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static Genre fromDbValue(String value) {
        if (value == null) {
            return null;
        }
        for (Genre g : values()) {
            if (g.dbValue.equals(value)) {
                return g;
            }
        }
        throw new IllegalArgumentException("Unknown genre: " + value);
    }
}