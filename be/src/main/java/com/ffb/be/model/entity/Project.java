package com.ffb.be.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"statuses", "sprints", "backlog", "activeSprint", "manager", "teamLead", "teamMembers"})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToOne
    @JoinColumn(name = "team_leader_username")
    private User teamLead;

    @OneToOne
    @JoinColumn(name = "backlog_sprint_id", referencedColumnName = "id")
    private Sprint backlog;

    @OneToOne
    @JoinColumn(name = "active_sprint_id", referencedColumnName = "id")
    private Sprint activeSprint;

    @ManyToOne
    @JoinColumn(name = "manager_username")
    private User manager;  // Single manager

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Status> statuses = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sprint> sprints = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_team_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_username")
    )
    private List<User> teamMembers = new ArrayList<>();

}

