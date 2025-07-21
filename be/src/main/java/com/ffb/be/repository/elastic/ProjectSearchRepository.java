package com.ffb.be.repository.elastic;

import com.ffb.be.model.document.ProjectDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ProjectSearchRepository extends ElasticsearchRepository<ProjectDocument, Long> {
}

