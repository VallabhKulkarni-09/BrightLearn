package com.brightlearn.dto.admin;

public class PasswordResetResponse {
    private String tempPassword;

    public PasswordResetResponse() {}

    public PasswordResetResponse(String tempPassword) {
        this.tempPassword = tempPassword;
    }

    public String getTempPassword() { return tempPassword; }
    public void setTempPassword(String tempPassword) { this.tempPassword = tempPassword; }
}
