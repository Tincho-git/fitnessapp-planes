package com.fitnessapp.main.repository;

import com.fitnessapp.main.entity.TrainingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, Long> {
    List<TrainingPlan> findByUserId(Long userId);
    List<TrainingPlan> findByUserEmail(String email);
}
