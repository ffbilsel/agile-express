package com.ffb.be.model.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Effort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @ManyToOne
    @JoinColumn(name = "issue_id")
    private Issue issue;

    @ManyToOne
    @JoinColumn(name = "person_username")
    private User person;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Override
    public String toString() {
        return "Effort{" +
                "id=" + id +
                ", startTime=" + startTime.toString() +
                ", endTime=" + endTime.toString() +
                ", issueId=" + (issue != null ? issue.getId() : null) +
                ", personUsername=" + (person != null ? person.getUsername() : null) +
                '}';
    }

}