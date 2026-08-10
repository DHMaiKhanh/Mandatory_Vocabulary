package com.vocab.web;

import com.vocab.model.Word;
import com.vocab.model.WordSet;
import com.vocab.repo.WordSetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sets")
public class WordSetController {

    private final WordSetRepository sets;

    public WordSetController(WordSetRepository sets) {
        this.sets = sets;
    }

    public record SetRequest(String name, String type) {}
    public record WordRequest(String term, String meaning, String example, String exampleMeaning, String note, String category, String pos) {}

    @GetMapping
    public List<WordSet> all() {
        return sets.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WordSet> one(@PathVariable Long id) {
        return sets.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public WordSet create(@RequestBody SetRequest req) {
        String name = (req.name() == null || req.name().isBlank()) ? "Bộ từ mới" : req.name().trim();
        String type = (req.type() == null || req.type().isBlank()) ? null : req.type().trim();
        return sets.save(new WordSet(name, System.currentTimeMillis(), type));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WordSet> rename(@PathVariable Long id, @RequestBody SetRequest req) {
        return sets.findById(id).map(set -> {
            if (req.name() != null && !req.name().isBlank()) {
                set.setName(req.name().trim());
            }
            return ResponseEntity.ok(sets.save(set));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!sets.existsById(id)) return ResponseEntity.notFound().build();
        sets.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Add a word (with optional example sentence) to a set. */
    @PostMapping("/{id}/words")
    public ResponseEntity<Word> addWord(@PathVariable Long id, @RequestBody WordRequest req) {
        return sets.findById(id).map(set -> {
            Word w = new Word();
            w.setTerm(req.term() == null ? "" : req.term().trim());
            w.setMeaning(req.meaning() == null ? "" : req.meaning().trim());
            w.setExample(req.example() == null ? "" : req.example().trim());
            w.setExampleMeaning(req.exampleMeaning() == null ? "" : req.exampleMeaning().trim());
            w.setNote(req.note() == null ? "" : req.note().trim());
            w.setCategory(req.category() == null ? "" : req.category().trim());
            w.setPos(req.pos() == null ? "" : req.pos().trim());
            w.setStatus("new");
            long now = System.currentTimeMillis();
            w.setAddedAt(now);
            w.setNextReview(now);
            set.addWord(w);
            sets.save(set);
            return ResponseEntity.ok(w);
        }).orElse(ResponseEntity.notFound().build());
    }
}
