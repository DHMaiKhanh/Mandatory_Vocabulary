package com.vocab.repo;

import com.vocab.model.WordSet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordSetRepository extends JpaRepository<WordSet, Long> {
}
