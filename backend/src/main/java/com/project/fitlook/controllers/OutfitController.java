package com.project.fitlook.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/outfit")
public class OutfitController {

    private final RestTemplate restTemplate = new RestTemplate();

    // application.properties dosyasından base URL'yi çekiyoruz
    @Value("${flask.api.url}")
    private String flaskApiUrl;

    @PostMapping("/outfit")
    public ResponseEntity<String> suggestOutfit(
            @RequestParam("analysis") String analysis,
            @RequestParam("event") String event) {

        // multipart/form-data body oluştur
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("analysis", analysis);
        body.add("event", event);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // flask.api.url + /outfit endpoint
        String requestUrl = flaskApiUrl + "/outfit";

        // Flask API'ye istek gönder
        ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, requestEntity, String.class);

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}
