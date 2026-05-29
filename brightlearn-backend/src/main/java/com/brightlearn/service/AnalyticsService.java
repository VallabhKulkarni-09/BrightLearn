package com.brightlearn.service;

import com.brightlearn.dto.analytics.AnalyticsDataPoint;
import com.brightlearn.dto.analytics.AnalyticsResponse;
import com.brightlearn.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    public AnalyticsService(UserRepository userRepository) {
    }

    public AnalyticsResponse getStudentAnalytics(String username) {
        // Mocking data for the last 7 days of lesson completion streak
        List<AnalyticsDataPoint> data = new ArrayList<>();
        List<AnalyticsDataPoint> comprehension = new ArrayList<>();
        List<AnalyticsDataPoint> notesLogged = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int completions = (int) (Math.random() * 4) + 1;
            int scores = (int) (Math.random() * 30) + 70; // 70% to 100% quiz scores
            int notes = (int) (Math.random() * 3);

            data.add(new AnalyticsDataPoint(date.format(formatter), completions));
            comprehension.add(new AnalyticsDataPoint(date.format(formatter), scores));
            notesLogged.add(new AnalyticsDataPoint(date.format(formatter), notes));
        }

        // Dwell Focus distribution
        List<AnalyticsDataPoint> dwellFocus = new ArrayList<>();
        dwellFocus.add(new AnalyticsDataPoint("Video Lessons", 45));
        dwellFocus.add(new AnalyticsDataPoint("Text Lessons", 30));
        dwellFocus.add(new AnalyticsDataPoint("Interactive Quizzes", 25));

        AnalyticsResponse response = new AnalyticsResponse(data);
        response.setComprehension(comprehension);
        response.setNotesLogged(notesLogged);
        response.setDwellFocus(dwellFocus);
        return response;
    }

    public AnalyticsResponse getInstructorAnalytics(String username) {
        // Mocking data for enrollment trends over the last 7 days
        List<AnalyticsDataPoint> data = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int value = (int) (Math.random() * 20) + 5;
            data.add(new AnalyticsDataPoint(date.format(formatter), value));
        }

        // Sankey Flow metrics (representing node stages: Enrolled ➔ Started ➔ Passed Quiz ➔ Completed)
        List<AnalyticsDataPoint> sankeyFlow = new ArrayList<>();
        sankeyFlow.add(new AnalyticsDataPoint("Enrolled", 150));
        sankeyFlow.add(new AnalyticsDataPoint("Started", 120));
        sankeyFlow.add(new AnalyticsDataPoint("Passed Quiz", 85));
        sankeyFlow.add(new AnalyticsDataPoint("Completed", 50));

        AnalyticsResponse response = new AnalyticsResponse(data);
        response.setSankeyFlow(sankeyFlow);
        response.setDropoutRate(35);
        response.setQuizFailureRate(18);
        response.setInteractionCount(52);
        return response;
    }
}
