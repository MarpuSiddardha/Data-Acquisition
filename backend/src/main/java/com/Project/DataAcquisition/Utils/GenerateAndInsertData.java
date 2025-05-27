package com.Project.DataAcquisition.Utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class GenerateAndInsertData {

    public static void insertQuery() {
        String url = "jdbc:postgresql://localhost:5432/DataAcquisition";
        String user = "postgres";
        String password = "postgres";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String insertSQL = "INSERT INTO public.sensor_data (id, sensor_id, sensor_type, timestamp, value, rtu_id) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(insertSQL);

            LocalDateTime startTimestamp = LocalDateTime.of(2025, 5, 1, 0, 0);
            LocalDateTime endTimestamp = LocalDateTime.of(2025, 5, 30, 23, 59);

            String[] sensorTypes = {"Temperature", "Humidity", "Pressure"};
            double[][] valueRanges = {{-10, 60}, {10, 90}, {0.95, 1.05}};
            int idCounter = 64801;
            Random random = new Random();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

            while (!startTimestamp.isAfter(endTimestamp)) {
                for (int rtuId = 1; rtuId <= 5; rtuId++) {
                    for (int i = 0; i < sensorTypes.length; i++) {
                        String sensorType = sensorTypes[i];
                        String sensorId = "RTU" + rtuId + "-" + sensorType + "001";
                        double value = Math.round((random.nextDouble() * (valueRanges[i][1] - valueRanges[i][0]) + valueRanges[i][0]) * 100.0) / 100.0;
                        Timestamp timestamp = Timestamp.valueOf(startTimestamp);

                        pstmt.setInt(1, idCounter);
                        pstmt.setString(2, sensorId);
                        pstmt.setString(3, sensorType);
                        pstmt.setTimestamp(4, timestamp);
                        pstmt.setDouble(5, value);
                        pstmt.setInt(6, rtuId);
                        pstmt.executeUpdate();

                        idCounter++;
                    }
                }
                startTimestamp = startTimestamp.plusMinutes(10);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
