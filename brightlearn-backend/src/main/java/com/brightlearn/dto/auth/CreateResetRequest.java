package com.brightlearn.dto.auth;

public class CreateResetRequest {
    private String username;
    private String note;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
