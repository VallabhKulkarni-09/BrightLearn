package com.brightlearn.dto.analytics;

import java.util.List;

public class AnalyticsResponse {
    private List<AnalyticsDataPoint> data;
    private List<AnalyticsDataPoint> comprehension;
    private List<AnalyticsDataPoint> notesLogged;
    private List<AnalyticsDataPoint> dwellFocus;
    private List<AnalyticsDataPoint> sankeyFlow;
    private int dropoutRate;
    private int quizFailureRate;
    private int interactionCount;

    public AnalyticsResponse() {}

    public AnalyticsResponse(List<AnalyticsDataPoint> data) {
        this.data = data;
    }

    public List<AnalyticsDataPoint> getData() { return data; }
    public void setData(List<AnalyticsDataPoint> data) { this.data = data; }

    public List<AnalyticsDataPoint> getComprehension() { return comprehension; }
    public void setComprehension(List<AnalyticsDataPoint> comprehension) { this.comprehension = comprehension; }

    public List<AnalyticsDataPoint> getNotesLogged() { return notesLogged; }
    public void setNotesLogged(List<AnalyticsDataPoint> notesLogged) { this.notesLogged = notesLogged; }

    public List<AnalyticsDataPoint> getDwellFocus() { return dwellFocus; }
    public void setDwellFocus(List<AnalyticsDataPoint> dwellFocus) { this.dwellFocus = dwellFocus; }

    public List<AnalyticsDataPoint> getSankeyFlow() { return sankeyFlow; }
    public void setSankeyFlow(List<AnalyticsDataPoint> sankeyFlow) { this.sankeyFlow = sankeyFlow; }

    public int getDropoutRate() { return dropoutRate; }
    public void setDropoutRate(int dropoutRate) { this.dropoutRate = dropoutRate; }

    public int getQuizFailureRate() { return quizFailureRate; }
    public void setQuizFailureRate(int quizFailureRate) { this.quizFailureRate = quizFailureRate; }

    public int getInteractionCount() { return interactionCount; }
    public void setInteractionCount(int interactionCount) { this.interactionCount = interactionCount; }
}
