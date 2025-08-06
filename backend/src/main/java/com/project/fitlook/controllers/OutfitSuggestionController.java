package com.project.fitlook.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/outfit")
public class OutfitSuggestionController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${flask.api.url}")
    private String flaskApiBaseUrl;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeOutfit(
            @RequestParam("image") MultipartFile image,
            @RequestParam("destination") String destination) throws IOException {

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        };

        HttpHeaders imageHeaders = new HttpHeaders();
        imageHeaders.setContentType(MediaType.parseMediaType(image.getContentType()));

        HttpEntity<ByteArrayResource> imagePart = new HttpEntity<>(resource, imageHeaders);
        body.add("image", imagePart);
        body.add("destination", destination);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String requestUrl = flaskApiBaseUrl + "/analyze";

        ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, requestEntity, String.class);

        System.out.println("Flask API response: " + response.getBody());

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}
