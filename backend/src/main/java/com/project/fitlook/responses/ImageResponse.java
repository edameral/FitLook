package com.project.fitlook.responses;

import com.project.fitlook.entities.Image;

import lombok.Data;

@Data
public class ImageResponse {
	private Long id;
	private String imageUrl;
	
	public ImageResponse(Image entity) {
		this.id = entity.getId();
		this.imageUrl = entity.getImageUrl();
	}
	
}
