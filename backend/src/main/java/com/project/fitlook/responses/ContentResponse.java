package com.project.fitlook.responses;

import com.project.fitlook.entities.Content;

import lombok.Data;

@Data
public class ContentResponse {
	Long id;
	String text;
	int type;
	int source;
	
	public ContentResponse(Content entity) {
		this.id = entity.getId();
		this.text = entity.getText();
		this.type = entity.getType();
		this.source = entity.getSource();
	}
	
}
