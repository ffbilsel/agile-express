package com.ffb.be.model.entity;


import com.ffb.be.model.enums.IssueType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    private String description;
    private double estimatedEffort;
    private int storyPoints;

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", nullable = false)
    private IssueType issueType = IssueType.STORY;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // User who assigned the issue
    @ManyToOne
    @JoinColumn(name = "assigner_username")
    private User assigner;

    // User assigned to work on the issue
    @ManyToOne
    @JoinColumn(name = "assignee_username")
    private User assignee;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Effort> efforts = new ArrayList<>();

    private LocalDateTime issuedAt;
    private LocalDateTime closedAt;

    @Override
    public String toString() {
        return "Issue{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", estimatedEffort=" + estimatedEffort +
                ", storyPoints=" + storyPoints +
                ", issueType=" + issueType +
                ", status=" + (status != null ? status.getName() : null) +
                ", sprintId=" + (sprint != null ? sprint.getId() : null) +
                ", projectId=" + (project != null ? project.getId() : null) +
                ", assignerUsername=" + (assigner != null ? assigner.getUsername() : null) +
                ", assigneeUsername=" + (assignee != null ? assignee.getUsername() : null) +
                ", effortsCount=" + (efforts != null ? efforts.size() : 0) +
                '}';
    }

}