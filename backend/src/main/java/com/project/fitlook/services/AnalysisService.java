package com.project.fitlook.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.fitlook.entities.Analysis;
import com.project.fitlook.entities.User;
import com.project.fitlook.repos.AnalysisRepository;
import com.project.fitlook.request.AnalysisCreateRequest;
import com.project.fitlook.responses.AnalysisResponse;

@Service
public class AnalysisService {
	
	private AnalysisRepository analysisRepository;
	private UserService userService;
	
	public AnalysisService(AnalysisRepository analysisRepository, UserService userService) {
		this.analysisRepository = analysisRepository;
		this.userService = userService;
	}
	
	public List<Analysis> getAllAnalyses(){
		return analysisRepository.findAll();
	}
	
	public List<Analysis> getAnalysisByUserId(Long userId){
		return analysisRepository.findByUserId(userId);
	}
	
	public AnalysisResponse getOneAnalysis(Long analysisId) {
		Analysis analysis = analysisRepository.findById(analysisId).orElse(null);
		return new AnalysisResponse(analysis);
	}
	
	public Analysis getOneAnalysisId(Long analysisId) {
		return analysisRepository.findById(analysisId).orElse(null);
	}
	
	public Analysis saveOneAnalysis(Analysis newSaveAnalysis){
		return analysisRepository.save(newSaveAnalysis);
	}
	
	public void deleteById(Long deleteAnalysis){
		analysisRepository.deleteById(deleteAnalysis);
	}
	
	public Analysis createOneAnalysis(AnalysisCreateRequest analysisCreateRequest) {
		User user = userService.getOneUserById(analysisCreateRequest.getUserId());
		if (user != null) {
			Analysis toSave = new Analysis();
			toSave.setId(analysisCreateRequest.getId());
			toSave.setUser(user);
			toSave.setTitle(analysisCreateRequest.getTitle());
			toSave.setCreatedAt(LocalDateTime.now());
			return analysisRepository.save(toSave);
		}		
		else {
			return null;
		}
	}
	
}
