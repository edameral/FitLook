package com.project.fitlook.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.fitlook.entities.Analysis;
import com.project.fitlook.entities.Content;
import com.project.fitlook.repos.ContentRepository;
import com.project.fitlook.request.ContentCreateRequest;
import com.project.fitlook.responses.ContentResponse;

@Service
public class ContentService {

	private ContentRepository contentRepository;
	private AnalysisService analysisService;
	
	public ContentService(ContentRepository contentRepository, AnalysisService analysisService) {
		this.contentRepository = contentRepository;
		this.analysisService = analysisService;
	}
	
	public List<Content> getAllContents(){
		return contentRepository.findAll();
	}
	
	public List<Content> getContentByAnalysisId(Long analysisId){
		return contentRepository.findByAnalysisId(analysisId);
	}
	
	public ContentResponse getOneContent(Long contentId) {
		Content content = contentRepository.findById(contentId).orElse(null);
		return new ContentResponse(content);
	}
	
	public Content getOneContentId(Long contentId) {
		return contentRepository.findById(contentId).orElse(null);
	}
	
	public Content saveOneContent(Content newSaveContent){
		return contentRepository.save(newSaveContent);
	}
	
	public void deleteById(Long deleteContent){
		contentRepository.deleteById(deleteContent);
	}
	
	public Content createOneContent(ContentCreateRequest contentCreateRequest) {
		Analysis analysis = analysisService.getOneAnalysisId(contentCreateRequest.getAnalysisId());
		if (analysis != null) {
			Content toSave = new Content();
			toSave.setId(contentCreateRequest.getId());
			toSave.setAnalysis(analysis);
			toSave.setText(contentCreateRequest.getText());
			toSave.setType(contentCreateRequest.getType());
			toSave.setSource(contentCreateRequest.getSource());
			toSave.setCreatedAt(LocalDateTime.now());
			return contentRepository.save(toSave);
		}		
		else {
			return null;
		}
	}
	
}
