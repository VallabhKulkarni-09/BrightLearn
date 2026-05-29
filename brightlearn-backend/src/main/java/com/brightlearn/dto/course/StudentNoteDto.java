package com.brightlearn.dto.course;

public class StudentNoteDto {
    private String content;

    public StudentNoteDto() {}

    public StudentNoteDto(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
