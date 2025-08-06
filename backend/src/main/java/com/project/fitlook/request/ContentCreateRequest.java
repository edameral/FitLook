package com.project.fitlook.request;

import lombok.Data;

@Data
public class ContentCreateRequest {
	Long id;
	Long analysisId;
	String text;
	int type;
	int source;
}
