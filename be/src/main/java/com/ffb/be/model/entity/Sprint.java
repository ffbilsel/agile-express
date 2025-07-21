package com.ffb.be.model.entity;


import com.ffb.be.model.enums.SprintStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    @Enumerated(EnumType.STRING)
    private SprintStatus sprintStatus = SprintStatus.PLANNED;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "sprint")
    private List<Issue> issues = new ArrayList<>();

    @Override
    public String toString() {
        return "Sprint{" +
                "id=" + id +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", sprintStatus=" + sprintStatus +
                ", projectId=" + (project != null ? project.getId() : null) +
                ", issuesCount=" + (issues != null ? issues.size() : 0) +
                '}';
    }

}