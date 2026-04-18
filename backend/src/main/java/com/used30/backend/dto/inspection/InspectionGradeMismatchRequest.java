package com.used30.backend.dto.inspection;

import com.used30.backend.domain.product.MediaGrade;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InspectionGradeMismatchRequest {

    @NotNull
    private MediaGrade inspectorMediaGrade;

    @NotNull
    private MediaGrade inspectorSleeveGrade;

    @NotNull
    @Positive
    private Integer adjustedPrice;

    private String notes;
}