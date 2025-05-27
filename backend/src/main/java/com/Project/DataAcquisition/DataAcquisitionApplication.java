package com.Project.DataAcquisition;

import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import com.Project.DataAcquisition.Utils.GenerateAndInsertData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import rules.DynamicRule;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.Project.DataAcquisition", "rules"})
public class DataAcquisitionApplication implements CommandLineRunner {
//public class DataAcquisitionApplication  {

	@Autowired
	private SensorRepository sensorRepository;

	@Autowired
	private DynamicRule dynamicRule;

	public static void main(String[] args) {
		SpringApplication.run(DataAcquisitionApplication.class, args);
		System.out.println("Successfully Executed");
	}

	@Override
	public void run(String... args) throws Exception {
		GenerateAndInsertData.insertQuery();
	}

}