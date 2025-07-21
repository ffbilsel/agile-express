package com.ffb.be.controller;

import com.ffb.be.model.dto.request.issue.SearchRequest;
import com.ffb.be.model.dto.response.SearchResponse;
import com.ffb.be.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public List<SearchResponse> searchIssues(
            @ModelAttribute SearchRequest request,
            Authentication authentication
    ) throws IOException {
        return searchService.search(request, authentication);
    }

}
