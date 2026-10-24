package com.fitnessapp.main.dto;

import lombok.Data;

@Data
public class ApplyTemplateRequest {
    private Long clientId;
    private Boolean replaceExisting;
}
