package com.ffb.be.repository.elastic;

import com.ffb.be.model.document.IssueDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface IssueSearchRepository extends ElasticsearchRepository<IssueDocument, Long> {
}

