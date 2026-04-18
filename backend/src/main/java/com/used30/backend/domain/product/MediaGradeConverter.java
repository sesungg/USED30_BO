package com.used30.backend.domain.product;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MediaGradeConverter implements AttributeConverter<MediaGrade, String> {

    @Override
    public String convertToDatabaseColumn(MediaGrade attribute) {
        return attribute == null ? null : attribute.getDbValue();
    }

    @Override
    public MediaGrade convertToEntityAttribute(String dbData) {
        return MediaGrade.fromDbValue(dbData);
    }
}