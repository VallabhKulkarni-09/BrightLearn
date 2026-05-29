package com.brightlearn.dto.auth;

public class SignupRequest {

    private String username;
    private String email;
    private String mobileNumber;
    private String password;

    public SignupRequest() {}

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getPassword() {
        return password;
    }
}
