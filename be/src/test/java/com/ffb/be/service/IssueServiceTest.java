package com.ffb.be.service;

import com.ffb.be.model.dto.request.issue.*;
import com.ffb.be.model.dto.response.EffortResponse;
import com.ffb.be.model.dto.response.IssueResponse;
import com.ffb.be.model.entity.*;
import com.ffb.be.model.exception.common.InvalidDataException;
import com.ffb.be.model.mapper.IssueMapper;
import com.ffb.be.repository.jpa.EffortRepository;
import com.ffb.be.repository.jpa.IssueRepository;
import com.ffb.be.repository.jpa.ProjectRepository;
import com.ffb.be.repository.jpa.SprintRepository;
import com.ffb.be.service.helper.EntityAccessHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

    @Mock private IssueRepository issueRepository;
    @Mock private SprintRepository sprintRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private EntityAccessHelper helper;
    @Mock private EffortRepository effortRepository;
    @Mock private Authentication auth;

    @InjectMocks
    private IssueService issueService;

    private Project project;
    private Issue issue;
    private User user;
    private Status status;
    private Effort effort;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);

        Sprint backlog = new Sprint();
        backlog.setIssues(new ArrayList<>());
        project.setBacklog(backlog);

        issue = new Issue();
        issue.setId(1L);
        issue.setProject(project);
        issue.setEfforts(new ArrayList<>());

        user = new User();
        user.setUsername("testuser");

        status = new Status();
        status.setName("TODO");

        effort = new Effort();
        effort.setId(1L);
        effort.setStartTime(LocalDateTime.of(2024, 1, 1, 9, 0));
        effort.setEndTime(LocalDateTime.of(2024, 1, 1, 17, 0));
    }

    // ========== CREATE ISSUE TESTS ==========

    @Test
    void createIssue_ValidPayload_Success() {
        IssueCreatePayload payload = new IssueCreatePayload();
        payload.setProjectId(1L);
        payload.setTitle("Test Issue");
        payload.setStatus("TODO");

        when(helper.getProject(1L)).thenReturn(project);
        when(helper.getStatusByStatusName(1L, "TODO")).thenReturn(status);
        when(helper.getUser(any())).thenReturn(user);
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> {
            Issue savedIssue = invocation.getArgument(0);
            savedIssue.setId(1L);
            return savedIssue;
        });

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.toDto(any())).thenReturn(IssueResponse.builder().build());

            IssueResponse result = issueService.createIssue(payload, auth);

            assertThat(result).isNotNull();
            verify(issueRepository).save(any(Issue.class));
        }
    }

    @Test
    void createIssue_NullTitle_ThrowsException() {
        IssueCreatePayload payload = new IssueCreatePayload();
        payload.setTitle(null);

        assertThatThrownBy(() -> issueService.createIssue(payload, auth))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Title is mandatory");
    }

    @Test
    void createIssue_BlankTitle_ThrowsException() {
        IssueCreatePayload payload = new IssueCreatePayload();
        payload.setTitle("   ");

        assertThatThrownBy(() -> issueService.createIssue(payload, auth))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("Title is mandatory");
    }

    // ========== UPDATE ISSUE TESTS ==========

    @Test
    void updateIssue_ValidPayload_Success() {
        IssueUpdatePayload payload = new IssueUpdatePayload();
        payload.setProjectId(1L);
        payload.setIssueId(1L);
        payload.setTitle("Updated Issue");
        payload.setStatus("TODO");

        when(helper.getIssue(1L, 1L)).thenReturn(issue);
        when(helper.getStatusByStatusName(1L, "TODO")).thenReturn(status);
        when(issueRepository.save(issue)).thenReturn(issue);

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.toDto(issue)).thenReturn(IssueResponse.builder().build());

            IssueResponse result = issueService.updateIssue(payload, auth);

            assertThat(result).isNotNull();
            verify(issueRepository).save(issue);
        }
    }

    @Test
    void updateIssue_InvalidTitle_ThrowsException() {
        IssueUpdatePayload payload = new IssueUpdatePayload();
        payload.setTitle("");

        assertThatThrownBy(() -> issueService.updateIssue(payload, auth))
                .isInstanceOf(InvalidDataException.class);
    }

    // ========== DELETE ISSUE TESTS ==========

    @Test
    void deleteIssue_ValidId_Success() {
        when(helper.getIssueById(1L)).thenReturn(issue);

        issueService.deleteIssue(1L, auth);

        verify(issueRepository).delete(issue);
    }

    // ========== VIEW ISSUE TESTS ==========

    @Test
    void viewIssue_ValidIds_Success() {
        when(helper.getIssue(1L, 1L)).thenReturn(issue);

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.toDto(issue)).thenReturn(IssueResponse.builder().build());

            IssueResponse result = issueService.viewIssue(1L, 1L, auth);

            assertThat(result).isNotNull();
        }
    }

    // ========== CREATE EFFORT TESTS ==========

    @Test
    void createEffort_ValidPayload_Success() {
        EffortCreatePayload payload = new EffortCreatePayload();
        payload.setProjectId(1L);
        payload.setIssueId(1L);
        payload.setStartTime(LocalDateTime.of(2024, 1, 2, 9, 0));
        payload.setEndTime(LocalDateTime.of(2024, 1, 2, 17, 0));

        when(helper.getIssue(1L, 1L)).thenReturn(issue);
        when(helper.getAuthorizedUser(eq(auth), eq(1L), any())).thenReturn(user);
        when(issueRepository.save(issue)).thenReturn(issue);

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.toDto(issue)).thenReturn(IssueResponse.builder().build());

            IssueResponse result = issueService.createEffort(payload, auth);

            assertThat(result).isNotNull();
            verify(effortRepository).save(any(Effort.class));
        }
    }

    @Test
    void createEffort_OverlappingEffort_ThrowsException() {
        issue.getEfforts().add(effort);

        EffortCreatePayload payload = new EffortCreatePayload();
        payload.setProjectId(1L);
        payload.setIssueId(1L);
        payload.setStartTime(LocalDateTime.of(2024, 1, 1, 12, 0));
        payload.setEndTime(LocalDateTime.of(2024, 1, 1, 18, 0));

        when(helper.getIssue(1L, 1L)).thenReturn(issue);
        when(helper.getAuthorizedUser(eq(auth), eq(1L), any())).thenReturn(user);

        assertThatThrownBy(() -> issueService.createEffort(payload, auth))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("efforts overlap");
    }

    // ========== UPDATE EFFORT TESTS ==========

    @Test
    void updateEffort_ValidPayload_Success() {
        EffortUpdatePayload payload = new EffortUpdatePayload();
        payload.setProjectId(1L);
        payload.setIssueId(1L);
        payload.setEffortId(1L);
        payload.setStartTime(LocalDateTime.of(2024, 1, 1, 10, 0));
        payload.setEndTime(LocalDateTime.of(2024, 1, 1, 18, 0));

        when(helper.getEffortWithIssue_Id(1L, 1L)).thenReturn(effort);
        when(effortRepository.save(effort)).thenReturn(effort);

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.effortToDto(effort)).thenReturn(new EffortResponse());

            EffortResponse result = issueService.updateEffort(payload, auth);

            assertThat(result).isNotNull();
            verify(effortRepository).save(effort);
        }
    }

    @Test
    void updateEffort_InvalidDates_ThrowsException() {
        EffortUpdatePayload payload = new EffortUpdatePayload();
        payload.setProjectId(1L);
        payload.setIssueId(1L);
        payload.setEffortId(1L);
        payload.setStartTime(LocalDateTime.of(2024, 1, 1, 18, 0));
        payload.setEndTime(LocalDateTime.of(2024, 1, 1, 10, 0));

        when(helper.getEffortWithIssue_Id(1L, 1L)).thenReturn(effort);

        assertThatThrownBy(() -> issueService.updateEffort(payload, auth))
                .isInstanceOf(InvalidDataException.class)
                .hasMessage("invalid dates");
    }

    // ========== DELETE EFFORT TESTS ==========

    @Test
    void deleteEffort_ValidIds_Success() {
        when(helper.getIssue(1L, 1L)).thenReturn(issue);
        when(helper.getEffortWithIssue_Id(1L, 1L)).thenReturn(effort);

        issueService.deleteEffort(1L, 1L, 1L, auth);

        verify(effortRepository).delete(effort);
    }

    // ========== VIEW EFFORT TESTS ==========

    @Test
    void viewEffort_ValidIds_Success() {
        when(helper.getEffortWithIssue_Id(1L, 1L)).thenReturn(effort);

        try (MockedStatic<IssueMapper> mapper = mockStatic(IssueMapper.class)) {
            mapper.when(() -> IssueMapper.effortToDto(effort)).thenReturn(new EffortResponse());

            EffortResponse result = issueService.viewEffort(1L, 1L, 1L, auth);

            assertThat(result).isNotNull();
        }
    }
}