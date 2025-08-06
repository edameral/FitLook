package com.project.fitlook.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.fitlook.entities.Content;
import com.project.fitlook.request.ContentCreateRequest;
import com.project.fitlook.responses.ContentResponse;
import com.project.fitlook.services.ContentService;

@RestController
@RequestMapping("/content")
public class ContentController {
	
	private ContentService contentService;

	public ContentController(ContentService contentService) {
		this.contentService = contentService;
	}
	
	@GetMapping
	public List<Content> getAllContents(){
		return contentService.getAllContents();
	}
	
	@GetMapping("/{contentId}")
	public ContentResponse getOneContent(@PathVariable long contentId){
		return contentService.getOneContent(contentId);
	}
	
	@GetMapping("/analysis/{analysisId}")
	public List<Content> getContentByAnalysisId(@PathVariable Long analysisId){
		return contentService.getContentByAnalysisId(analysisId);
	}
	
	@PostMapping
	public Content getOneCreateContent(@RequestBody ContentCreateRequest contentCreateRequest){
		return contentService.createOneContent(contentCreateRequest);
	}
	
}
