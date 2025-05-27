package com.Project.DataAcquisition.Exception;

import lombok.AllArgsConstructor;

import lombok.Data;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;

import java.util.Map;

@RestControllerAdvice

public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)

    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage()), HttpStatus.NOT_FOUND);

    }

    @ExceptionHandler(InvalidInputException.class)

    public ResponseEntity<Object> handleInvalidInput(InvalidInputException ex) {

        return new ResponseEntity<>(new ErrorResponse("INVALID_INPUT", ex.getMessage()), HttpStatus.BAD_REQUEST);

    }

    @ExceptionHandler(Exception.class)

    public ResponseEntity<Object> handleGenericException(Exception ex) {

        // You can log this exception for debugging

        ex.printStackTrace(); // or use a logger

        return new ResponseEntity<>(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @Data

    @AllArgsConstructor

    static class ErrorResponse {

        private String errorCode;

        private String message;

    }


    public class ResourceNotFoundException extends RuntimeException {

        public ResourceNotFoundException(String message) {

            super(message);

        }

    }

    public static class InvalidInputException extends RuntimeException {

        public InvalidInputException(String message) {

            super(message);

        }

    }

    public static class InvalidSensorDataException extends RuntimeException {

        public InvalidSensorDataException(String message) {

            super(message);

        }

    }

    @ExceptionHandler(InvalidSensorDataException.class)

    public ResponseEntity<Map<String, Object>> handleInvalidSensorData(InvalidSensorDataException ex) {

        Map<String, Object> response = new HashMap<>();

        response.put("error", "Validation Failed");

        response.put("message", "Wrong RTUs or Sensor Types or Sensor IDs selected");

        response.put("details", ex.getMessage()); // Optional, for debugging

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

    }


}

