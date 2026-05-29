package com.brightlearn.exception;

import com.brightlearn.dto.common.ApiError;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiError> handleBadCredentials(
                        BadCredentialsException ex,
                        HttpServletRequest request) {
                ApiError error = new ApiError(
                                HttpStatus.UNAUTHORIZED.value(),
                                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                                "Invalid username or password",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiError> handleAccessDenied(
                        AccessDeniedException ex,
                        HttpServletRequest request) {
                ApiError error = new ApiError(
                                HttpStatus.FORBIDDEN.value(),
                                HttpStatus.FORBIDDEN.getReasonPhrase(),
                                "Access denied",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiError> handleValidationErrors(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                String message = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                ApiError error = new ApiError(
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                message,
                                request.getRequestURI());
                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiError> handleBadRequest(
                        BadRequestException ex,
                        HttpServletRequest request) {
                ApiError error = new ApiError(
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiError> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {
                try {
                        java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("c:\\Users\\vallabh.kulakarni1\\project\\error.log", true));
                        pw.println("----- NEW ERROR -----");
                        ex.printStackTrace(pw);
                        pw.close();
                } catch (Exception e) {}

                ApiError error = new ApiError(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(error);
        }
}
