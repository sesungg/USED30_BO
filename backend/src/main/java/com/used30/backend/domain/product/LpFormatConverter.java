package com.used30.backend.domain.product;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class LpFormatConverter implements AttributeConverter<LpFormat, String> {

    @Override
    public String convertToDatabaseColumn(LpFormat attribute) {
        return attribute == null ? null : attribute.getDbValue();
    }

    @Override
    public LpFormat convertToEntityAttribute(String dbData) {
        return LpFormat.fromDbValue(dbData);
    }
}