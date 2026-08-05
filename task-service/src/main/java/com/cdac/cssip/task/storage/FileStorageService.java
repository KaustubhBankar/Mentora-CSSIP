package com.cdac.cssip.task.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "txt", "zip",
            "png", "jpg", "jpeg"
    );

    private final Path assignmentDirectory;
    private final Path submissionDirectory;

    public FileStorageService(
            @Value("${task.storage.assignment-dir}")
            String assignmentDirectory,
            @Value("${task.storage.submission-dir}")
            String submissionDirectory
    ) {
        this.assignmentDirectory =
                Paths.get(assignmentDirectory).toAbsolutePath().normalize();
        this.submissionDirectory =
                Paths.get(submissionDirectory).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.assignmentDirectory);
            Files.createDirectories(this.submissionDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to create task upload directories",
                    exception
            );
        }
    }

    public StoredFile storeAssignment(MultipartFile file) {
        return store(file, assignmentDirectory);
    }

    public StoredFile storeSubmission(MultipartFile file) {
        return store(file, submissionDirectory);
    }

    public Resource load(String path) {
        try {
            Resource resource = new UrlResource(
                    Paths.get(path).toAbsolutePath().normalize().toUri()
            );

            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("File not found");
            }

            return resource;
        } catch (Exception exception) {
            throw new IllegalArgumentException(
                    "Unable to load requested file",
                    exception
            );
        }
    }

    public void delete(String path) {
        if (path == null || path.isBlank()) {
            return;
        }

        try {
            Files.deleteIfExists(
                    Paths.get(path).toAbsolutePath().normalize()
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to delete stored file",
                    exception
            );
        }
    }

    private StoredFile store(MultipartFile file, Path directory) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? "file"
                        : file.getOriginalFilename()
        );

        if (originalName.contains("..")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String extension = extensionOf(originalName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Unsupported file type: " + extension
            );
        }

        String storedName = UUID.randomUUID() + "." + extension;
        Path destination = directory.resolve(storedName).normalize();

        if (!destination.startsWith(directory)) {
            throw new SecurityException("Invalid file destination");
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to store uploaded file",
                    exception
            );
        }

        return new StoredFile(
                originalName,
                storedName,
                file.getContentType(),
                file.getSize(),
                destination.toString()
        );
    }

    private String extensionOf(String fileName) {
        int index = fileName.lastIndexOf('.');

        if (index < 0 || index == fileName.length() - 1) {
            throw new IllegalArgumentException(
                    "File extension is required"
            );
        }

        return fileName.substring(index + 1).toLowerCase();
    }

    public record StoredFile(
            String originalName,
            String storedName,
            String contentType,
            Long size,
            String path
    ) {
    }
}
