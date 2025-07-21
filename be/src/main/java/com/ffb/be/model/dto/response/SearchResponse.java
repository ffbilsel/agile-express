package com.ffb.be.model.dto.response;

import com.ffb.be.model.enums.SearchType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchResponse {

    private SearchType searchType;
    private IssueResponse issue;
    private ProjectResponse project;

}
