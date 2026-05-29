package com.brightlearn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "discussion_comments")
public class DiscussionComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private DiscussionComment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiscussionComment> replies = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany
    @JoinTable(
        name = "comment_upvotes",
        joinColumns = @JoinColumn(name = "comment_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private java.util.Set<User> upvotedUsers = new java.util.HashSet<>();

    public DiscussionComment() {}

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

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }

    public DiscussionComment getParent() {
        return parent;
    }

    public void setParent(DiscussionComment parent) {
        this.parent = parent;
    }

    public List<DiscussionComment> getReplies() {
        return replies;
    }

    public void setReplies(List<DiscussionComment> replies) {
        this.replies = replies;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getUpvotes() {
        return upvotedUsers != null ? upvotedUsers.size() : 0;
    }

    public void setUpvotes(int upvotes) {
        // No-op or keep for backwards compatibility/JPA binding
    }

    public java.util.Set<User> getUpvotedUsers() {
        return upvotedUsers;
    }

    public void setUpvotedUsers(java.util.Set<User> upvotedUsers) {
        this.upvotedUsers = upvotedUsers;
    }
}
