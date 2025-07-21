package com.ffb.be.repository.jpa;


import com.ffb.be.model.entity.Effort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EffortRepository extends JpaRepository<Effort, Long> {

    Optional<Effort> findEffortByIdAndIssue_Id(Long id, Long issueId);

}
