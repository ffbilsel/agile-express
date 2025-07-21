package com.ffb.be.model.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "issues")
@JsonIgnoreProperties(ignoreUnknown = true)
public class IssueDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private String issueType;

    @Field(type = FieldType.Keyword)
    private String statusName;

    @Field(type = FieldType.Keyword)
    private String projectName;

    @Field(type = FieldType.Keyword)
    private Long projectId;

    @Field(type = FieldType.Keyword)
    private String assignerUsername;

    @Field(type = FieldType.Keyword)
    private String assigneeUsername;

}

