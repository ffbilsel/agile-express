package com.ffb.be.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Status {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Override
    public String toString() {
        return "Status{" +
                "name='" + name + '\'' +
                // avoid printing project or print only project id to prevent recursion
                ", projectId=" + (project != null ? project.getId() : null) +
                '}';
    }

}