package com.fitnessapp.main.controller;

import com.fitnessapp.main.dto.ApplyTemplateRequest;
import com.fitnessapp.main.dto.RoutineTemplateRequest;
import com.fitnessapp.main.entity.RoutineTemplate;
import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.service.RoutineTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@PreAuthorize("hasRole('PROFESOR')")
public class RoutineTemplateController {

    private final RoutineTemplateService routineTemplateService;

    public RoutineTemplateController(RoutineTemplateService routineTemplateService) {
        this.routineTemplateService = routineTemplateService;
    }

    @GetMapping
    public ResponseEntity<List<RoutineTemplate>> getMyTemplates(Authentication authentication) {
        return ResponseEntity.ok(routineTemplateService.getTemplatesByProfessor(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<RoutineTemplate> createTemplate(@RequestBody RoutineTemplateRequest request, Authentication authentication) {
        return ResponseEntity.ok(routineTemplateService.createTemplate(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineTemplate> updateTemplate(@PathVariable Long id, @RequestBody RoutineTemplateRequest request, Authentication authentication) {
        return ResponseEntity.ok(routineTemplateService.updateTemplate(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id, Authentication authentication) {
        routineTemplateService.deleteTemplate(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/from-client/{clientId}")
    public ResponseEntity<RoutineTemplate> createFromClient(@PathVariable Long clientId, @RequestBody RoutineTemplateRequest request, Authentication authentication) {
        return ResponseEntity.ok(routineTemplateService.createTemplateFromClientPlan(clientId, request, authentication.getName()));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<List<TrainingPlan>> applyTemplate(@PathVariable Long id, @RequestBody ApplyTemplateRequest request, Authentication authentication) {
        return ResponseEntity.ok(routineTemplateService.applyTemplateToClient(id, request, authentication.getName()));
    }
}
