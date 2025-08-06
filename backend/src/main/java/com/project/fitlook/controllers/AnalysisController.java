package com.project.fitlook.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.fitlook.entities.Analysis;
import com.project.fitlook.request.AnalysisCreateRequest;
import com.project.fitlook.responses.AnalysisResponse;
import com.project.fitlook.services.AnalysisService;

@RestController
@RequestMapping("/analysis")
public class AnalysisController {
	
	private AnalysisService analysisService;

	public AnalysisController(AnalysisService analysisService) {
		this.analysisService = analysisService;
	}
	
	@GetMapping
	public List<Analysis> getAllAnalyses(){
		return analysisService.getAllAnalyses();
	}
	
	@GetMapping("/{analysisId}")
	public AnalysisResponse getOneAnalysis(@PathVariable long analysisId){
		return analysisService.getOneAnalysis(analysisId);
	}
	
	@GetMapping("/user/{userId}")
	public List<Analysis> getAnalysisByUserId(@PathVariable Long userId){
		System.out.println("categorye göre liste");
		return analysisService.getAnalysisByUserId(userId);
	}
	
	@PostMapping
	public Analysis getOneCreateAnalysis(@RequestBody AnalysisCreateRequest analysisCreateRequest){
		return analysisService.createOneAnalysis(analysisCreateRequest);
	}
	
	@DeleteMapping("/{analysisId}")
	public void deleteOneAnalysis(@PathVariable long analysisId){
		analysisService.deleteById(analysisId);
	}
	
	
}
