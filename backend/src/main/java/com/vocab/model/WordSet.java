package com.vocab.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "word_sets")
public class WordSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Long createdAt;

    @OneToMany(mappedBy = "set", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Word> words = new ArrayList<>();

    public WordSet() {
    }

    public WordSet(String name, Long createdAt) {
        this.name = name;
        this.createdAt = createdAt;
    }

    /** Keeps both sides of the relationship in sync. */
    public void addWord(Word w) {
        w.setSet(this);
        this.words.add(w);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public List<Word> getWords() { return words; }
    public void setWords(List<Word> words) { this.words = words; }
}
