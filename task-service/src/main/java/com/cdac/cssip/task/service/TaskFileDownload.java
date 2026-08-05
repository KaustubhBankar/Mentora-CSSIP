package com.cdac.cssip.task.service;

import org.springframework.core.io.Resource;

public record TaskFileDownload(
        Resource resource,
        String fileName,
        String contentType
) {
}
