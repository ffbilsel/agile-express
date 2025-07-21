package com.ffb.be.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.ffb.be.model.document.IssueDocument;
import com.ffb.be.model.document.ProjectDocument;
import com.ffb.be.model.dto.request.issue.SearchRequest;
import com.ffb.be.model.dto.response.ProjectResponse;
import com.ffb.be.model.enums.SearchType;
import com.ffb.be.model.mapper.IssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ElasticsearchClient elasticsearchClient;
    private final ProjectService projectService;

    public List<com.ffb.be.model.dto.response.SearchResponse> search(SearchRequest request, Authentication auth) throws IOException {

        // 1. Get authorized projects
        List<ProjectResponse> authorizedProjects = projectService.viewAllProjects(auth);
        List<Long> projectIds = authorizedProjects.stream()
                .map(ProjectResponse::getId)
                .distinct()
                .toList();
        List<FieldValue> projectIdValues = projectIds.stream()
                .map(FieldValue::of)
                .toList();

        List<com.ffb.be.model.dto.response.SearchResponse> results = new ArrayList<>();

        // 2. Search ISSUES
        List<Query> issueQueries = new ArrayList<>();
        if (!projectIds.isEmpty()) {
            issueQueries.add(Query.of(q -> q.terms(t -> t.field("projectId").terms(v -> v.value(projectIdValues)))));
        }
        if (request.getProjectName() != null) {
            issueQueries.add(Query.of(q -> q.match(m -> m.field("projectName").query(request.getProjectName()))));
        }
        if (request.getTitle() != null) {
            issueQueries.add(Query.of(q -> q.match(m -> m.field("title").query(request.getTitle()))));
        }
        if (request.getDescription() != null) {
            issueQueries.add(Query.of(q -> q.match(m -> m.field("description").query(request.getDescription()))));
        }
        if (request.getIssueType() != null) {
            issueQueries.add(Query.of(q -> q.term(t -> t.field("issueType").value(request.getIssueType().name().toLowerCase()))));
        }
        if (request.getStatusName() != null) {
            issueQueries.add(Query.of(q -> q.match(m -> m.field("statusName").query(request.getStatusName()))));
        }
        if (request.getUserName() != null) {
            issueQueries.add(Query.of(q -> q.bool(b -> b.should(
                    Query.of(q1 -> q1.match(m -> m.field("assignerUsername").query(request.getUserName()))),
                    Query.of(q2 -> q2.match(m -> m.field("assigneeUsername").query(request.getUserName())))
            ))));
        }

        if (!issueQueries.isEmpty()) {
            SearchResponse<IssueDocument> issueResponse = elasticsearchClient.search(s -> s
                            .index("issues")
                            .query(q -> q.bool(b -> b.must(issueQueries))),
                    IssueDocument.class
            );

            results.addAll(issueResponse.hits().hits().stream()
                    .map(hit -> new com.ffb.be.model.dto.response.SearchResponse(
                            SearchType.ISSUE,
                            IssueMapper.documentToDto(hit.source()),
                            null
                    ))
                    .toList());
        }

        // 3. Search PROJECTS
        List<Query> projectQueries = new ArrayList<>();

        if (request.getProjectName() != null) {
            projectQueries.add(Query.of(q -> q.match(m -> m.field("name").query(request.getProjectName()))));
        }

        if (!projectIds.isEmpty()) {
            // always restrict to authorized projects
            projectQueries.add(Query.of(q -> q.terms(t -> t.field("id").terms(v -> v.value(projectIdValues)))));
        }

        if (!projectQueries.isEmpty()) {
            SearchResponse<ProjectDocument> projectResponse = elasticsearchClient.search(s -> s
                            .index("projects")
                            .query(q -> q.bool(b -> b.must(projectQueries))),
                    ProjectDocument.class
            );

            results.addAll(projectResponse.hits().hits().stream()
                    .map(hit -> new com.ffb.be.model.dto.response.SearchResponse(
                            SearchType.PROJECT,
                            null,
                            ProjectResponse.builder().id(hit.source().getId()).name(hit.source().getName()).build()
                    ))
                    .toList());
        }

        return results;
    }
}
