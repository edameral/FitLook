package com.project.fitlook.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/style")
public class StyleAdvisorController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${flask.api.url}")
    private String flaskApiBaseUrl;

    @PostMapping("/create")
    public ResponseEntity<String> createStyleSuggestion(@RequestBody Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        String requestUrl = flaskApiBaseUrl + "/suggest";

        ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, requestEntity, String.class);

        System.out.println("Flask API response kombin öneri: " + response.getBody());

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}
