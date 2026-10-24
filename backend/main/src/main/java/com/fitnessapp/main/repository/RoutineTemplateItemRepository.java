package com.fitnessapp.main.repository;

import com.fitnessapp.main.entity.RoutineTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineTemplateItemRepository extends JpaRepository<RoutineTemplateItem, Long> {
    void deleteByExerciseId(Long exerciseId);
}
