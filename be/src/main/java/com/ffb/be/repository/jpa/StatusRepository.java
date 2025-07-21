package com.ffb.be.repository.jpa;


import com.ffb.be.model.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Long> {

    Optional<Status> findStatusByNameAndProject_Id(String name, Long projectId);

}
