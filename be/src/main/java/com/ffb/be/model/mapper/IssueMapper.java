package com.ffb.be.model.mapper;

import com.ffb.be.model.document.IssueDocument;
import com.ffb.be.model.dto.response.EffortResponse;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.model.entity.Effort;
import com.ffb.be.model.entity.Issue;
import com.ffb.be.model.enums.IssueType;

import java.util.Collections;
import java.util.List;

public class IssueMapper {

    public static IssueResponse toDto(Issue issue) {
        if (issue == null) {
            return null;
        }

        String assignee = issue.getAssignee() != null ? issue.getAssignee().getUsername() : null;
        String assigner = issue.getAssigner() != null ? issue.getAssigner().getUsername() : null;
        long id = issue.getId() != null ? issue.getId() : -1;
        String status = (issue.getStatus() != null && issue.getStatus().getName() != null) ? issue.getStatus().getName() : null;
        List<EffortResponse> efforts = issue.getEfforts() != null
                ? issue.getEfforts().stream()
                .map(IssueMapper::effortToDto)
                .toList()
                : Collections.emptyList();

        // Null-safe handling for projectId and sprintId
        long projectId = (issue.getProject() != null && issue.getProject().getId() != null)
                ? issue.getProject().getId() : -1L;
        long sprintId = (issue.getSprint() != null && issue.getSprint().getId() != null)
                ? issue.getSprint().getId() : -1L;

        return IssueResponse.builder()
                .title(issue.getTitle())
                .projectId(projectId)
                .sprintId(sprintId)
                .issueType(issue.getIssueType())
                .assignee(assignee)
                .assigner(assigner)
                .id(id)
                .description(issue.getDescription())
                .estimatedEffort(issue.getEstimatedEffort())
                .status(status)
                .efforts(efforts)
                .storyPoints(issue.getStoryPoints())
                .issuedAt(issue.getIssuedAt())
                .closedAt(issue.getClosedAt())
                .build();
    }

    public static IssueResponse documentToDto(IssueDocument issueDocument) {
        if (issueDocument == null) {
            return null;
        }

        return IssueResponse.builder()
                .title(issueDocument.getTitle())
                .projectId(issueDocument.getProjectId())
                .issueType(IssueType.valueOf(issueDocument.getIssueType()))
                .assignee(issueDocument.getAssigneeUsername())
                .assigner(issueDocument.getAssignerUsername())
                .id(issueDocument.getId())
                .description(issueDocument.getDescription())
                .status(issueDocument.getStatusName())
                .build();
    }

    public static EffortResponse effortToDto(Effort effort) {
        return new EffortResponse(effort.getIssue() != null
                ? effort.getIssue().getId() != null
                ? effort.getIssue().getId() : -1
                : -1,
                effort.getId(), effort.getDescription(),
                effort.getPerson() != null ? effort.getPerson().getUsername() : null,
                effort.getStartTime(), effort.getEndTime());
    }

}