package com.used30.backend.dto.inspection;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InspectionRejectRequest {

    @NotBlank
    private String rejectionReason;

    private String notes;
}