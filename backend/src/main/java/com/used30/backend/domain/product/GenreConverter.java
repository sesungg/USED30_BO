package com.used30.backend.domain.product;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GenreConverter implements AttributeConverter<Genre, String> {

    @Override
    public String convertToDatabaseColumn(Genre attribute) {
        return attribute == null ? null : attribute.getDbValue();
    }

    @Override
    public Genre convertToEntityAttribute(String dbData) {
        return Genre.fromDbValue(dbData);
    }
}