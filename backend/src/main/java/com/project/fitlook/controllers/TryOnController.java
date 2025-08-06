package com.project.fitlook.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/tryon")
public class TryOnController {

    @Value("${flask.api.url}") // application.properties içinde flask API base URL'i
    private String flaskApiUrl;

    private final RestTemplate restTemplate;

    public TryOnController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // JSON body ile direkt Map olarak alıyoruz
    @PostMapping
    public ResponseEntity<?> tryOn(@RequestBody Map<String, Object> payload) {
        String flaskEndpoint = flaskApiUrl + "/tryon";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(flaskEndpoint, entity, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Flask sunucusuna istek gönderilirken hata oluştu: " + e.getMessage());
        }
    }
}
