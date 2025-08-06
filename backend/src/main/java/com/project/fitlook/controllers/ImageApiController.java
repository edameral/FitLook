package com.project.fitlook.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ImageApiController {

    private final ImageGenerationService imageGenerationService;

    public ImageApiController(ImageGenerationService imageGenerationService) {
        this.imageGenerationService = imageGenerationService;
    }

    @PostMapping("/generate-images")
    public ResponseEntity<Map<String, Object>> generateImages(@RequestBody Map<String, String> suggestions) {
        System.out.println("gelen veri : " + suggestions);
        Map<String, Object> response = imageGenerationService.callFlaskApi(suggestions);
        return ResponseEntity.ok(response);
    }
}

@Service
class ImageGenerationService {

    private final RestTemplate restTemplate = new RestTemplate();

    // application.properties içindeki değer buraya gelir
    @Value("${flask.api.url}")
    private String flaskApiBaseUrl;

    public Map<String, Object> callFlaskApi(Map<String, String> suggestions) {
        String flaskUrl = flaskApiBaseUrl + "/generate"; // base + endpoint

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(suggestions, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(flaskUrl, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RuntimeException("Flask API çağrısı başarısız oldu: " + response.getStatusCode());
        }
    }
}
