package com.ffb.be.repository.jpa;


import com.ffb.be.model.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    Optional<Sprint> findSprintByIdAndProject_Id(Long id, Long projectId);

    @Query("SELECT s FROM Sprint s WHERE s.sprintStatus = 'ACTIVE' AND s.endDate BETWEEN :start AND :end")
    List<Sprint> findActiveSprintsEndingBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

}
