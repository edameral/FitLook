package com.project.fitlook.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.fitlook.entities.Image;

public interface ImageRepository extends JpaRepository<Image, Long>{
	List<Image> findByAnalysisId(Long storiesId);
}
