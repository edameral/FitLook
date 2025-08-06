package com.project.fitlook.responses;

import java.time.LocalDateTime;

import com.project.fitlook.entities.Analysis;

import lombok.Data;

@Data
public class AnalysisResponse {
	private Long id;
	private String title;
	private LocalDateTime createdAt; 
	
	public AnalysisResponse(Analysis entity) {
		this.id = entity.getId();
		this.title = entity.getTitle();
		this.createdAt = entity.getCreatedAt();
	}
	
}
