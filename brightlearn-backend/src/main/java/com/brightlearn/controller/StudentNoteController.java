package com.brightlearn.controller;

import com.brightlearn.dto.course.StudentNoteDto;
import com.brightlearn.entity.Lesson;
import com.brightlearn.entity.StudentNote;
import com.brightlearn.entity.User;
import com.brightlearn.repository.LessonRepository;
import com.brightlearn.repository.StudentNoteRepository;
import com.brightlearn.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/notes")
public class StudentNoteController {

    private final StudentNoteRepository studentNoteRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    public StudentNoteController(StudentNoteRepository studentNoteRepository, UserRepository userRepository, LessonRepository lessonRepository) {
        this.studentNoteRepository = studentNoteRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
    }

    @GetMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StudentNoteDto> getNote(@PathVariable Long lessonId, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Optional<StudentNote> note = studentNoteRepository.findByUserIdAndLessonId(user.getId(), lessonId);
        return note.map(studentNote -> ResponseEntity.ok(new StudentNoteDto(studentNote.getContent())))
                   .orElseGet(() -> ResponseEntity.ok(new StudentNoteDto("")));
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> saveNote(@PathVariable Long lessonId, @RequestBody StudentNoteDto request, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();

        StudentNote note = studentNoteRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElse(new StudentNote());

        note.setUser(user);
        note.setLesson(lesson);
        note.setContent(request.getContent());
        note.setUpdatedAt(Instant.now());

        studentNoteRepository.save(note);
        return ResponseEntity.ok().build();
    }
}
