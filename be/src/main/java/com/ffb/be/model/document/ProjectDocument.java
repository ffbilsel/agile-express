package com.ffb.be.model.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Document(indexName = "projects")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String name;

}

