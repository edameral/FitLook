package com.project.fitlook.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.fitlook.entities.Analysis;
import com.project.fitlook.entities.Image;
import com.project.fitlook.repos.AnalysisRepository;
import com.project.fitlook.repos.ImageRepository;
import com.project.fitlook.request.ImageRequest;
import com.project.fitlook.responses.ImageResponse;

@Service
public class ImageService {
	private final ImageRepository imageRepository;
	private final AnalysisRepository analysisRepository;
	
	public ImageService(ImageRepository imageRepository, AnalysisRepository analysisRepository) {
		this.imageRepository = imageRepository;
		this.analysisRepository = analysisRepository;
	}
	
	public List<ImageResponse> getAnalysisPartImageByAnalysisId(Long analysisId){
		return imageRepository.findByAnalysisId(analysisId).stream().map(ImageResponse::new).collect(Collectors.toList());
	}
	
	public void deleteImage(Long id) {
		imageRepository.deleteById(id);
	}
	
	public Image createStoriesPartImages(ImageRequest request){
		Analysis analysis = analysisRepository.findById(request.getAnalysisId()).orElse(null);
		if (analysis == null) {
			return null;
		}
		Image images = new Image();
		images.setImageUrl(request.getImageUrl());
		images.setAnalysis(analysis);
		return imageRepository.save(images);
	}
	
	
}
