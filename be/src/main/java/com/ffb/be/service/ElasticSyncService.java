package com.ffb.be.service;

import com.ffb.be.model.document.IssueDocument;
import com.ffb.be.model.document.ProjectDocument;
import com.ffb.be.model.entity.Issue;
import com.ffb.be.model.entity.Project;
import com.ffb.be.repository.elastic.IssueSearchRepository;
import com.ffb.be.repository.elastic.ProjectSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ElasticSyncService {

    private final IssueSearchRepository issueSearchRepository;
    private final ProjectSearchRepository projectSearchRepository;

    public void indexIssue(Issue issue) {
        IssueDocument doc = new IssueDocument();
        doc.setId(issue.getId());
        doc.setTitle(issue.getTitle());
        doc.setDescription(issue.getDescription());
        doc.setIssueType(issue.getIssueType().name());
        doc.setStatusName(issue.getStatus().getName());
        doc.setProjectId(issue.getProject().getId());
        doc.setProjectName(issue.getProject().getName());
        doc.setAssigneeUsername(issue.getAssignee() != null ? issue.getAssignee().getUsername() : null);
        doc.setAssignerUsername(issue.getAssigner() != null ? issue.getAssigner().getUsername() : null);

        issueSearchRepository.save(doc);
    }

    public void indexProject(Project project) {
        ProjectDocument doc = new ProjectDocument();
        doc.setId(project.getId());
        doc.setName(project.getName());

        projectSearchRepository.save(doc);
    }

}
