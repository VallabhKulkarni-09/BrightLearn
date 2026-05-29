package com.brightlearn.dto.discussion;

import java.time.LocalDateTime;

public class DiscussionCommentResponse {

    private Long id;
    private String content;
    private String authorUsername;
    private String authorRole;
    private Long parentId;
    private LocalDateTime createdAt;
    private int upvotes;
    private boolean hasUpvoted;

    public DiscussionCommentResponse() {}

    public DiscussionCommentResponse(Long id, String content, String authorUsername, String authorRole, Long parentId, LocalDateTime createdAt, int upvotes, boolean hasUpvoted) {
        this.id = id;
        this.content = content;
        this.authorUsername = authorUsername;
        this.authorRole = authorRole;
        this.parentId = parentId;
        this.createdAt = createdAt;
        this.upvotes = upvotes;
        this.hasUpvoted = hasUpvoted;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(int upvotes) {
        this.upvotes = upvotes;
    }

    public boolean isHasUpvoted() {
        return hasUpvoted;
    }

    public void setHasUpvoted(boolean hasUpvoted) {
        this.hasUpvoted = hasUpvoted;
    }
}
