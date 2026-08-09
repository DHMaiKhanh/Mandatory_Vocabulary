package com.vocab.web;

import com.vocab.model.Word;
import com.vocab.repo.WordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Update / delete individual words. The frontend owns the spaced-repetition
 * logic and sends the full updated word (term, meaning, example, box, reps,
 * correct, wrong, status, timestamps) which is simply persisted here.
 */
@RestController
@RequestMapping("/api/words")
public class WordController {

    private final WordRepository words;

    public WordController(WordRepository words) {
        this.words = words;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Word> update(@PathVariable Long id, @RequestBody Word patch) {
        return words.findById(id).map(w -> {
            if (patch.getTerm() != null) w.setTerm(patch.getTerm());
            if (patch.getMeaning() != null) w.setMeaning(patch.getMeaning());
            if (patch.getExample() != null) w.setExample(patch.getExample());
            if (patch.getNote() != null) w.setNote(patch.getNote());
            if (patch.getCategory() != null) w.setCategory(patch.getCategory());
            if (patch.getStatus() != null) w.setStatus(patch.getStatus());
            w.setBox(patch.getBox());
            w.setReps(patch.getReps());
            w.setCorrect(patch.getCorrect());
            w.setWrong(patch.getWrong());
            if (patch.getLastStudied() != null) w.setLastStudied(patch.getLastStudied());
            if (patch.getNextReview() != null) w.setNextReview(patch.getNextReview());
            return ResponseEntity.ok(words.save(w));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!words.existsById(id)) return ResponseEntity.notFound().build();
        words.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
