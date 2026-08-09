package com.vocab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "words")
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String term;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String example;

    // Spaced-repetition (Leitner) state
    private int box = 0;
    private int reps = 0;
    private int correct = 0;
    private int wrong = 0;

    /** new | learning | mastered */
    private String status = "new";

    private Long addedAt;
    private Long lastStudied;
    private Long nextReview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id")
    @JsonIgnore
    private WordSet set;

    public Word() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public String getExample() { return example; }
    public void setExample(String example) { this.example = example; }

    public int getBox() { return box; }
    public void setBox(int box) { this.box = box; }

    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }

    public int getCorrect() { return correct; }
    public void setCorrect(int correct) { this.correct = correct; }

    public int getWrong() { return wrong; }
    public void setWrong(int wrong) { this.wrong = wrong; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAddedAt() { return addedAt; }
    public void setAddedAt(Long addedAt) { this.addedAt = addedAt; }

    public Long getLastStudied() { return lastStudied; }
    public void setLastStudied(Long lastStudied) { this.lastStudied = lastStudied; }

    public Long getNextReview() { return nextReview; }
    public void setNextReview(Long nextReview) { this.nextReview = nextReview; }

    @JsonIgnore
    public WordSet getSet() { return set; }
    public void setSet(WordSet set) { this.set = set; }

    /** Exposed in JSON so the frontend knows which set a word belongs to. */
    public Long getSetId() {
        return set != null ? set.getId() : null;
    }
}
