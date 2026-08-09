# VocabMaster — Web học từ vựng tiếng Anh (kiểu Quizlet)

Ứng dụng học từ vựng tiếng Anh với Flashcard, 2 trò chơi (Match & Gravity),
phát âm bằng loa, bảng thống kê và chế độ **học mỗi ngày 10 từ mới + ôn 20 từ cũ**
theo phương pháp lặp lại ngắt quãng (Leitner).

- **Frontend:** ReactJS (Vite) — toàn bộ giao diện, trò chơi, phát âm, logic học.
- **Backend:** Java (Spring Boot + H2) — REST API lưu bộ từ / từ vựng / ví dụ / tiến độ
  xuống database trên máy.
- Nếu **không** bật backend, app vẫn chạy được và tự lưu vào **localStorage** của trình duyệt.

---

## 1. Yêu cầu (máy bạn đã cài đủ)
- Node.js 18+ (đang dùng v24)
- Java 17+ (đang dùng JDK 21)
- Maven 3.9+

## 2. Cách chạy

### Cách nhanh: nhấp đúp file .bat
1. Chạy **`run-backend.bat`**  → mở cửa sổ backend (http://localhost:8090)
2. Chạy **`run-frontend.bat`** → mở cửa sổ frontend (http://localhost:5180)
3. Mở trình duyệt: **http://localhost:5180**

### Hoặc chạy bằng lệnh
```bash
# Cửa sổ 1 — Backend (Java)
cd backend
mvn spring-boot:run          # chạy ở http://localhost:8090

# Cửa sổ 2 — Frontend (React)
cd frontend
npm install                  # chỉ cần lần đầu
npm run dev                  # chạy ở http://localhost:5180
```

> Ghi chú cổng: dùng **8090** (backend) và **5180** (frontend) vì cổng mặc định
> 8080/5173 đang bị một ứng dụng khác trên máy bạn chiếm.

## 3. Dữ liệu được lưu ở đâu?
- Khi bật backend: lưu trong `backend/data/vocabdb.mv.db` (H2 database).
- Khi tắt backend: lưu trong localStorage của trình duyệt (khoá `vocab_data_v1`).
- Xem database qua H2 Console: http://localhost:8090/h2-console
  (JDBC URL: `jdbc:h2:file:./data/vocabdb`, user `sa`, không mật khẩu).

Góc trên bên phải hiển thị **● Server** (đang dùng backend) hoặc **● Offline** (dùng localStorage).

---

## 4. Tính năng
| Màn hình | Mô tả |
|----------|-------|
| **Trang chủ** | Tổng quan tiến độ, số từ, độ chính xác, phím tắt vào các chức năng. |
| **Bộ từ** | Tạo/sửa/xoá bộ từ; thêm **từ + nghĩa + câu ví dụ** cho mỗi từ; có loa phát âm. |
| **Học hôm nay** | Phiên học **10 từ mới + 20 từ ôn**; tự chấm "Đã thuộc / Chưa thuộc" → cập nhật lịch ôn. |
| **Trò chơi** | **Flashcard** (lật thẻ), **Match** (ghép từ–nghĩa, tính giờ), **Gravity** (gõ từ trước khi rơi chạm đáy). |
| **Thống kê** | Bảng theo dõi từng từ: trạng thái, cấp độ, số lần học, độ chính xác, ngày học/thêm. Sắp xếp & tìm kiếm được. |

### Cơ chế học lặp lại ngắt quãng (Leitner)
Mỗi từ có 6 "hộp" (box 0→5). Trả lời **đúng** → lên 1 hộp và giãn thời gian ôn
(10 phút → 1 → 2 → 4 → 7 → 15 ngày). Trả lời **sai** → về hộp 0, ôn lại sớm.
Đạt hộp 5 → **Thành thạo**. Mỗi ngày hệ thống đưa tối đa 10 từ mới + 20 từ đến hạn ôn.

### Loa phát âm
Dùng Web Speech API sẵn có của trình duyệt (ưu tiên giọng tiếng Anh) — bấm nút 🔊
ở mỗi từ hoặc câu ví dụ. Nên dùng Chrome/Edge để có giọng đọc tốt nhất.

---

## 5. Cấu trúc dự án
```
Mandatory_Vocabulary_Claude/
├─ backend/                     # Java Spring Boot
│  ├─ pom.xml
│  └─ src/main/java/com/vocab/
│     ├─ VocabApplication.java   # điểm khởi động
│     ├─ WebConfig.java          # CORS
│     ├─ DataSeeder.java         # tạo bộ từ mẫu lần đầu
│     ├─ model/                  # WordSet, Word (JPA entity)
│     ├─ repo/                   # Spring Data repositories
│     └─ web/                    # REST controllers
├─ frontend/                    # ReactJS (Vite)
│  └─ src/
│     ├─ App.jsx                 # khung + điều hướng
│     ├─ store.jsx               # state toàn cục (context)
│     ├─ api/storage.js          # gọi API + fallback localStorage
│     ├─ hooks/useSpeech.js      # phát âm
│     ├─ lib/srs.js              # logic Leitner + thống kê
│     └─ views/                  # Dashboard, Sets, Daily, Games, Flashcards, MatchGame, GravityGame, Stats
└─ README.md
```

## 6. REST API (backend)
| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | `/api/sets` | Lấy tất cả bộ từ (kèm từ vựng) |
| POST | `/api/sets` | Tạo bộ từ `{ name }` |
| PUT | `/api/sets/{id}` | Đổi tên bộ từ |
| DELETE | `/api/sets/{id}` | Xoá bộ từ |
| POST | `/api/sets/{id}/words` | Thêm từ `{ term, meaning, example }` |
| PUT | `/api/words/{id}` | Cập nhật từ (nghĩa, ví dụ, tiến độ học) |
| DELETE | `/api/words/{id}` | Xoá từ |
