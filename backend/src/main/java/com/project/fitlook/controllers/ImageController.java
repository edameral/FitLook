package com.project.fitlook.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.fitlook.entities.Image;
import com.project.fitlook.request.ImageRequest;
import com.project.fitlook.responses.ImageResponse;
import com.project.fitlook.services.ImageService;

@RestController
@RequestMapping("/images")
public class ImageController {

	private final ImageService imageService;

	public ImageController(ImageService imageService) {
		this.imageService = imageService;
	}
	
	@GetMapping("/analysis/{analysisId}")
	public List<ImageResponse> getImageByAnalysis(@PathVariable Long analysisId){
		return imageService.getAnalysisPartImageByAnalysisId(analysisId);
	}
	
	@PostMapping
	public Image createImages(@RequestBody ImageRequest request) {
		return imageService.createStoriesPartImages(request);
	}
	
	@DeleteMapping("/{id}")
	public void deleteImage(@PathVariable Long id) {
		imageService.deleteImage(id);
	}
	
}
