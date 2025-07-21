package com.ffb.be.model.entity;

import com.ffb.be.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"managedProjects", "leadingProject", "memberProject", "assignedIssues", "assignedIssuesByThisUser"})
public class User {

    @Id
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String email;

    @Column(nullable = false)
    private int tokenVersion = 0;

    @OneToMany(mappedBy = "manager")
    private List<Project> managedProjects = new ArrayList<>();

    @OneToOne(mappedBy = "teamLead")
    private Project leadingProject;

    @ManyToOne
    @JoinColumn(name = "member_project_id")
    private Project memberProject;

    @OneToMany(mappedBy = "assignee")
    private List<Issue> assignedIssues = new ArrayList<>();

    @OneToMany(mappedBy = "assigner")
    private List<Issue> assignedIssuesByThisUser = new ArrayList<>();

}

