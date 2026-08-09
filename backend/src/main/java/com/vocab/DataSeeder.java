package com.vocab;

import com.vocab.model.Word;
import com.vocab.model.WordSet;
import com.vocab.repo.WordSetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Creates a sample set on first run so the app is not empty. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final WordSetRepository sets;

    public DataSeeder(WordSetRepository sets) {
        this.sets = sets;
    }

    @Override
    public void run(String... args) {
        if (sets.count() > 0) return;

        WordSet set = new WordSet("Bộ từ mẫu (600 từ TOEIC - phần 1)", System.currentTimeMillis());
        String[][] data = {
                {"abandon", "từ bỏ, bỏ rơi", "They had to abandon the plan due to lack of money."},
                {"benefit", "lợi ích", "Regular exercise has many health benefits."},
                {"consider", "cân nhắc, xem xét", "We should consider all the options before deciding."},
                {"deadline", "hạn chót", "The deadline for the report is next Friday."},
                {"efficient", "hiệu quả", "The new system is more efficient than the old one."},
                {"forecast", "dự báo", "The weather forecast says it will rain tomorrow."},
                {"generate", "tạo ra, sản sinh", "Solar panels generate electricity from sunlight."},
                {"handle", "xử lý, giải quyết", "She knows how to handle difficult customers."},
                {"improve", "cải thiện", "I want to improve my English speaking skills."},
                {"justify", "biện minh, chứng minh là đúng", "He could not justify his decision to the team."},
                {"knowledge", "kiến thức", "Reading books expands your knowledge."},
                {"launch", "ra mắt, khởi động", "The company will launch a new product next month."},
                {"maintain", "duy trì, bảo trì", "It is important to maintain a healthy lifestyle."},
                {"negotiate", "đàm phán", "The two sides are trying to negotiate a deal."},
                {"opportunity", "cơ hội", "This job is a great opportunity for me."},
                {"purchase", "mua, sự mua hàng", "You can purchase tickets online."},
                {"reduce", "giảm bớt", "We need to reduce our spending this year."},
                {"schedule", "lịch trình, lên lịch", "Let's schedule a meeting for Monday."},
                {"target", "mục tiêu", "Our target is to double sales this quarter."},
                {"upgrade", "nâng cấp", "You should upgrade your software regularly."},
        };

        long now = System.currentTimeMillis();
        for (String[] row : data) {
            Word w = new Word();
            w.setTerm(row[0]);
            w.setMeaning(row[1]);
            w.setExample(row[2]);
            w.setStatus("new");
            w.setAddedAt(now);
            w.setNextReview(now);
            set.addWord(w);
        }
        sets.save(set);
        System.out.println("[DataSeeder] Seeded sample set with " + data.length + " words.");
    }
}
