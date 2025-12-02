/**
 * Historical ratings timeline component
 */

import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Employee } from "../../types/employee";

interface RatingsTimelineProps {
  employee: Employee;
}

export const RatingsTimeline: React.FC<RatingsTimelineProps> = ({ employee }) => {
  // Sort ratings history by year descending
  const sortedRatings = [...employee.ratings_history].sort((a, b) => b.year - a.year);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Performance History
        </Typography>

        <Timeline position="right" sx={{ p: 0, m: 0 }}>
          {/* Current Year (2025) */}
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="success" />
              {sortedRatings.length > 0 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body2" fontWeight="medium">
                2025 (Current)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Performance: {employee.performance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Potential: {employee.potential}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Current Assessment
              </Typography>
            </TimelineContent>
          </TimelineItem>

          {/* Historical Ratings */}
          {sortedRatings.map((rating, index) => (
            <TimelineItem key={rating.year}>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                {index < sortedRatings.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" fontWeight="medium">
                  {rating.year}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rating: {rating.rating}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        {sortedRatings.length === 0 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              No historical ratings available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
