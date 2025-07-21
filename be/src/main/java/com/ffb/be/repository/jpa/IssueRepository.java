package com.ffb.be.repository.jpa;


import com.ffb.be.model.entity.Issue;
import com.ffb.be.model.entity.Status;
import com.ffb.be.model.enums.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    Optional<Issue> findIssueByIdAndProject_Id(Long projectId, Long id);

    @Query("""
      select count(i) from Issue i
      where i.assignee.username = :username
        and i.closedAt is not null
        and i.closedAt >= :start
        and i.closedAt < :end
    """)
    int countClosedByAssigneeInRange(
            @Param("username") String username,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<Issue> findAllByStatus(Status status);

    Optional<Issue> findIssueByIdAndProject_IdAndSprint_Id(Long id, Long projectId, Long sprintId);

    int countByClosedAtIsNullAndAssignee_UsernameOrAssigner_Username(String assigneeUsername, String assignerUsername);

    List<Issue> findAllByAssignee_UsernameOrAssigner_Username(String assigneeUsername, String assignerUsername);

    List<Issue> findAllByProject_IdAndAssignee_UsernameOrAssigner_Username(Long projectId, String assigneeUsername, String assignerUsername);

    @Query("""
    SELECT i FROM Issue i
    LEFT JOIN i.project p
    LEFT JOIN i.status s
    LEFT JOIN i.assigner a
    LEFT JOIN i.assignee u
    WHERE
        (:projectIds IS NULL OR p.id IN :projectIds)
        AND (:projectName IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :projectName, '%')))
        AND (:title IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:description IS NULL OR LOWER(i.description) LIKE LOWER(CONCAT('%', :description, '%')))
        AND (:issueType IS NULL OR i.issueType = :issueType)
        AND (:statusName IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :statusName, '%')))
        AND (
            :userName IS NULL OR
            LOWER(a.username) LIKE LOWER(CONCAT('%', :userName, '%')) OR
            LOWER(u.username) LIKE LOWER(CONCAT('%', :userName, '%'))
        )
""")
    List<Issue> searchIssues(
            @Param("projectIds") List<Long> projectIds,
            @Param("projectName") String projectName,
            @Param("title") String title,
            @Param("description") String description,
            @Param("issueType") IssueType issueType,
            @Param("statusName") String statusName,
            @Param("userName") String userName
    );

}