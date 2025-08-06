package com.project.fitlook.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class FindLinksController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${flask.api.url}")
    private String flaskApiBaseUrl;

    private String getPythonApiUrl() {
        return flaskApiBaseUrl + "/links";
    }

    @PostMapping("/find-links")
    public ResponseEntity<?> findLinks(@RequestBody Map<String, Object> payload) {
        if (!payload.containsKey("outfit_url") || payload.get("outfit_url") == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "outfit_url (görsel URL) zorunlu"));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    getPythonApiUrl(),
                    HttpMethod.POST,
                    requestEntity,
                    Object.class
            );

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Python API çağrılırken hata oluştu", "details", e.getMessage()));
        }
    }
}
