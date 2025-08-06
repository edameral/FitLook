package com.project.fitlook.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.fitlook.entities.Analysis;

public interface AnalysisRepository  extends JpaRepository<Analysis, Long>{
	
	List<Analysis> findByUserId(Long userId);
	
}
