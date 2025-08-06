package com.project.fitlook.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.fitlook.entities.Content;

public interface ContentRepository extends JpaRepository<Content, Long>{
	List<Content> findByAnalysisId(Long userId);
}
