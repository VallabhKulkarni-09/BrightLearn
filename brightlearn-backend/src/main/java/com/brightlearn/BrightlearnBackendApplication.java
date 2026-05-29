package com.brightlearn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;
import java.util.List;

@SpringBootApplication
public class BrightlearnBackendApplication {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@PostConstruct
	public void dropLegacyQuizUniqueConstraint() {
		try (java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("c:\\Users\\vallabh.kulakarni1\\project\\error.log", true))) {
			// 0. Drop legacy quiz_attempts table if exists
			try {
				jdbcTemplate.execute("DROP TABLE IF EXISTS quiz_attempts");
				pw.println("Dropped legacy table quiz_attempts");
			} catch (Exception e) {
				pw.println("Failed to drop legacy table quiz_attempts: " + e.getMessage());
			}

			// 1. Find foreign key on lesson_id
			List<String> fkNames = jdbcTemplate.queryForList(
				"SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE " +
				"WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quizzes' " +
				"AND COLUMN_NAME = 'lesson_id' AND REFERENCED_TABLE_NAME IS NOT NULL", String.class);
				
			// 2. Find unique index on lesson_id
			List<String> indexNames = jdbcTemplate.queryForList(
				"SELECT index_name FROM information_schema.statistics " +
				"WHERE table_schema = DATABASE() AND table_name = 'quizzes' " +
				"AND column_name = 'lesson_id' AND non_unique = 0", String.class);
			
			if (indexNames.isEmpty()) {
				pw.println("No unique index found. Migration already applied.");
			} else {
				// Drop FKs first
				for (String fk : fkNames) {
					jdbcTemplate.execute("ALTER TABLE quizzes DROP FOREIGN KEY " + fk);
					pw.println("Dropped FK: " + fk);
				}
				
				// Drop Unique Indexes
				for (String idx : indexNames) {
					jdbcTemplate.execute("ALTER TABLE quizzes DROP INDEX " + idx);
					pw.println("Dropped Unique Index: " + idx);
				}
				
				// Recreate FK
				jdbcTemplate.execute("ALTER TABLE quizzes ADD CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)");
				pw.println("Recreated standard FK constraint");
			}
			pw.println("----- MIGRATION COMPLETE -----");
		} catch (Exception e) {
			try (java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("c:\\Users\\vallabh.kulakarni1\\project\\error.log", true))) {
				pw.println("----- MIGRATION ERROR -----");
				e.printStackTrace(pw);
			} catch (Exception ex) {}
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(BrightlearnBackendApplication.class, args);
		System.out.println("-----------Hi welcome to Universe !--------------");

		System.out.println(new BCryptPasswordEncoder().encode("Vallabh@123"));
		System.out.println("Swagger UI -->  http://localhost:8080/swagger-ui/index.html#/");
	}
}