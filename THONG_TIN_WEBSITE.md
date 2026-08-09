# 🌐 Thông tin Website VocabMaster (bản online)

Tài liệu ghi lại **toàn bộ** việc đưa VocabMaster lên mạng: link, quá trình làm,
kết quả, cách duy trì lâu dài, cách xử lý sự cố và mọi thứ liên quan.

> 📄 File này là **bản ghi & sổ tay bảo trì**. File [DEPLOY.md](DEPLOY.md) là
> hướng dẫn thao tác deploy từng bước. Hai file bổ trợ cho nhau.

---

## 1. Thông tin nhanh (tra cứu)

| Mục | Giá trị |
|-----|---------|
| **Link website (dùng thay localhost)** | **https://vocabmaster-6icb.onrender.com** |
| API kiểm tra nhanh | https://vocabmaster-6icb.onrender.com/api/sets |
| Nhà cung cấp (host) | **Render.com** — gói **Free** |
| Loại service | Web Service chạy bằng **Docker** |
| Service ID (Render) | `srv-d9s3snvavr4c73adjvl0` |
| Database | **PostgreSQL** trên Render, tên `vocab-db` (gói Free) |
| Mã nguồn (GitHub) | https://github.com/DHMaiKhanh/Mandatory_Vocabulary |
| Nhánh deploy | `main` |
| Ngày lên sóng | 09/08/2026 |
| Chi phí hiện tại | **0 đồng** |

---

## 2. Kết quả — đã chạy thật, đã kiểm tra

Sau khi deploy, đã kiểm tra **end-to-end** (không chỉ "live"):

- ✅ **Giao diện (React)** hiện đúng tại `/` — tiêu đề "VocabMaster — Học từ vựng tiếng Anh".
- ✅ **Backend (Spring Boot)** chạy, API `/api/sets` trả JSON.
- ✅ **Database Postgres** đã nối đúng — dữ liệu mẫu 20 từ (abandon, benefit, consider…)
  do `DataSeeder` tạo đã được lưu và đọc lại thành công.
- ✅ **Frontend + API chung 1 domain** → không lỗi CORS, đường dẫn `/api` tương đối chạy thẳng.

Kết luận: mở link trên **điện thoại / máy khác / gửi bạn bè** đều dùng được, **không cần localhost**.

---

## 3. TẤT CẢ CÁC BƯỚC TẠO LINK (chi tiết, làm lại được)

Ghi lại đầy đủ mọi bước theo trình tự, kèm lệnh cụ thể. Ai làm theo đúng thứ tự này
sẽ ra được một link online y hệt.

### GIAI ĐOẠN 0 — Khảo sát dự án (hiểu trước khi sửa)
Đọc cấu trúc để chọn cách deploy phù hợp. Phát hiện quan trọng:
- Frontend gọi API bằng **đường dẫn tương đối `/api`** (`frontend/src/api/storage.js`)
  → nếu để frontend và backend **chung 1 domain** thì chạy thẳng, khỏi sửa URL, khỏi lo CORS.
- Backend dùng **H2 lưu ra file** → host free sẽ xoá → cần đổi sang Postgres khi deploy.
- Entity dùng `GenerationType.IDENTITY` và cột `TEXT` → **tương thích Postgres**, không phải sửa.
- Frontend **không dùng client-side routing** → không cần cấu hình SPA fallback.

### GIAI ĐOẠN 1 — Sửa/tạo file để deploy được

**Bước 1.1 — Thêm driver PostgreSQL vào `backend/pom.xml`** (giữ nguyên H2 cho local):
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Bước 1.2 — Tạo `backend/src/main/resources/application-prod.properties`**
(cấu hình chỉ dùng khi deploy: trỏ Postgres, đọc cổng từ biến `PORT`, tắt H2 console):
```properties
server.port=${PORT:8090}
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.h2.console.enabled=false
```

**Bước 1.3 — Tạo `Dockerfile`** (gói React + Spring Boot thành 1 image, 3 giai đoạn):
build React (Node) → copy `dist` vào `static/` của Spring Boot → `mvn package` ra JAR →
image runtime chỉ có JRE. (Xem nội dung đầy đủ ở [Dockerfile](Dockerfile).)

**Bước 1.4 — Tạo `render.yaml`** (bản thiết kế cho Render: 1 web service Docker + 1 Postgres,
tự nối các biến `DB_*`, đặt `SPRING_PROFILES_ACTIVE=prod`). (Xem [render.yaml](render.yaml).)

**Bước 1.5 — Tạo `.gitignore` và `.dockerignore`** (không đẩy `node_modules`, `dist`,
`target`, `backend/data`, và artefact rác `.playwright-mcp/`).

### GIAI ĐOẠN 2 — Kiểm tra tại máy TRƯỚC khi đẩy đi
(Để không tốn thời gian chờ Render rồi mới phát hiện lỗi.)

**Bước 2.1 — Build frontend:**
```powershell
cd frontend
npm run build        # ra thư mục dist/ (index.html + assets) — OK
```

**Bước 2.2 — Gói thử JAR đúng như Dockerfile làm** (dùng JDK 21 + Maven sẵn có):
```powershell
# (thư mục gốc) copy bản build của FE vào static của BE rồi đóng gói:
mkdir backend/src/main/resources/static
cp -r frontend/dist/* backend/src/main/resources/static/
cd backend
mvn -q clean package -DskipTests      # ra target/vocab-backend-1.0.0.jar (48.9 MB) — OK
```
→ Kiểm tra frontend đã nằm trong JAR: có `BOOT-INF/classes/static/index.html` ✔️
→ **Dọn file tạm** sau khi kiểm tra: xoá `backend/src/main/resources/static` và `backend/target`.

### GIAI ĐOẠN 3 — Đưa mã nguồn lên GitHub

**Bước 3.1 — Khởi tạo repo & xem trước file sẽ commit** (chắc chắn không dính file rác):
```powershell
git init
git add -A
git status              # kiểm tra không có node_modules/dist/target/data
```

**Bước 3.2 — Loại thư mục rác `.playwright-mcp/` khỏi commit** (thêm vào `.gitignore` rồi):
```powershell
git rm -r --cached .playwright-mcp
git add .gitignore
```

**Bước 3.3 — Commit và đặt nhánh chính:**
```powershell
git commit -m "VocabMaster: chuan bi deploy len Render (gop FE+BE, Dockerfile, Postgres prod)"
git branch -M main
```

**Bước 3.4 — Tạo repo trống trên GitHub** (https://github.com/new, không thêm README),
lấy URL rồi nối remote:
```powershell
git remote add origin https://github.com/DHMaiKhanh/Mandatory_Vocabulary.git
```

**Bước 3.5 — Push. Gặp lỗi SSL của Windows và cách sửa:**
```powershell
git push -u origin main
# ❌ Lỗi: SSL certificate problem: unable to get local issuer certificate
# ✅ Sửa: cho Git dùng kho chứng chỉ Windows (KHÔNG tắt kiểm tra bảo mật):
git config http.sslBackend schannel
git push -u origin main
# ✅ Thành công: new branch main -> main
```

### GIAI ĐOẠN 4 — Deploy trên Render (Blueprint)
1. https://dashboard.render.com → đăng nhập bằng **GitHub**.
2. **New +** → **Blueprint** → chọn repo `DHMaiKhanh/Mandatory_Vocabulary`
   (lần đầu bấm **Connect / cấp quyền** cho Render đọc repo).
3. Render tự đọc `render.yaml`, hiện: **Create database vocab-db** + **Create web service vocabmaster**.
4. Điền **Blueprint Name** = `vocabmaster`; **Branch** = `main`; **Blueprint Path** để trống.
5. Bấm **Apply**. Render tạo Postgres + build Docker (~5–10 phút, xem tab **Logs**).
6. Khi service chuyển **Live** (tích xanh) → Render cấp link:
   **https://vocabmaster-6icb.onrender.com**

### GIAI ĐOẠN 5 — Kiểm tra link thật (nghiệm thu)
- Gọi `https://vocabmaster-6icb.onrender.com/api/sets` → trả JSON 1 bộ, 20 từ
  (abandon, benefit, consider…) ✔️ → **backend + Postgres OK**.
- Mở `https://vocabmaster-6icb.onrender.com/` → tiêu đề "VocabMaster — Học từ vựng tiếng Anh" ✔️
  → **frontend được phục vụ OK**.
- → Toàn bộ end-to-end chạy. **Có link online dùng thay localhost.** 🎉

> Từ đây về sau, mỗi lần sửa code chỉ cần `git push` là Render tự build lại (xem mục 4.1).

---

## 4. ⭐ Cách DUY TRÌ LÂU DÀI (quan trọng)

### 4.1. Cập nhật website khi sửa code
Chỉ cần đẩy code mới lên GitHub, Render **tự build lại** (khoảng 5–10 phút):
```powershell
git add .
git commit -m "mo ta thay doi"
git push
```
Xem tiến trình build ở tab **Logs** hoặc **Events** trên Render. Khi thấy "Deploy live" (tích xanh) là xong.

### 4.2. Chuyện "app ngủ" (cold start) — bình thường, không phải lỗi
- Gói Free: sau **~15 phút không ai truy cập**, Render **tắt tạm** app.
- Lần mở kế tiếp app **khởi động lại**, chờ **~50 giây** rồi chạy bình thường.
- Muốn **luôn bật, không chờ**: nâng cấp gói trả phí trên Render (mục 8), hoặc dùng cách
  "ping định kỳ" (mục 7 — Câu hỏi thường gặp).

### 4.3. ⚠️ Giữ DATABASE lâu dài (điều cần lưu ý NHẤT)
Postgres **Free của Render có giới hạn thời gian** — sau một thời gian Render sẽ ngừng/xoá DB free.
Nếu điều đó xảy ra, **dữ liệu bộ từ sẽ mất**. Có 2 hướng xử lý:

**A) Chuyển database sang Neon (miễn phí, KHÔNG hết hạn) — khuyên dùng**
1. Tạo project trên https://neon.tech → lấy **connection string**:
   `postgresql://user:pass@ep-xxx.neon.tech/dbname`
2. Trên Render → service `vocabmaster` → tab **Environment**:
   - **Xoá** 5 biến `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
   - **Thêm** 3 biến:
     - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://ep-xxx.neon.tech/dbname?sslmode=require`
     - `SPRING_DATASOURCE_USERNAME` = `user`
     - `SPRING_DATASOURCE_PASSWORD` = `pass`
3. Lưu → Render tự khởi động lại. Xong.

> App đọc thông tin DB qua biến môi trường chuẩn, nên **đổi nhà cung cấp DB chỉ là đổi giá trị
> biến, không cần sửa code**.

**B) Nâng cấp Postgres của Render lên gói trả phí** (giữ nguyên mọi thứ, tốn tiền/tháng).

### 4.4. Sao lưu (backup) dữ liệu định kỳ
Để phòng mất dữ liệu, thỉnh thoảng nên **xuất (dump)** database:
- Trên Render: mục **Databases** → `vocab-db` → có nút kết nối / hướng dẫn dùng `pg_dump`.
- Hoặc dùng công cụ như **DBeaver / pgAdmin** kết nối tới DB (bằng connection string) rồi export.

### 4.5. Theo dõi tình trạng
- **Logs**: xem nhật ký chạy / lỗi realtime (tab **Logs**).
- **Events**: lịch sử deploy (tab **Events**).
- **Metrics**: CPU, RAM, lượt request (tab **Metrics**).

---

## 5. Kiến trúc bản online (sơ đồ)

```
Người dùng (điện thoại/máy tính)
        │  https://vocabmaster-6icb.onrender.com
        ▼
┌─────────────────────────────────────────────┐
│   Render Web Service "vocabmaster" (Docker)   │
│                                               │
│   Spring Boot (Java 21) — 1 process:          │
│   • "/"        → phục vụ React (file tĩnh)     │
│   • "/api/**"  → REST API (bộ từ, từ vựng…)    │
└───────────────┬───────────────────────────────┘
                │  JDBC (SPRING_PROFILES_ACTIVE=prod)
                ▼
      ┌───────────────────────────┐
      │  PostgreSQL "vocab-db"     │
      │  (dữ liệu bộ từ / tiến độ) │
      └───────────────────────────┘
```

So với lúc chạy ở máy: local là **2 tiến trình** (Vite 5180 + Spring Boot 8090 + H2 file);
online là **1 tiến trình** (Spring Boot phục vụ cả web + API) + **Postgres**.

---

## 6. Các file cấu hình deploy (giải thích)

| File | Vai trò |
|------|---------|
| [Dockerfile](Dockerfile) | Công thức 3 giai đoạn: build React → gắn vào Spring Boot → tạo JAR → image nhẹ chỉ có JRE. |
| [render.yaml](render.yaml) | "Bản thiết kế" cho Render: tạo sẵn web service + Postgres và **tự nối** thông tin DB vào app. |
| [backend/src/main/resources/application-prod.properties](backend/src/main/resources/application-prod.properties) | Cấu hình **chỉ dùng khi deploy**: trỏ tới Postgres, tắt H2 console, đọc cổng từ biến `PORT`. |
| [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties) | Cấu hình **local** (H2 file) — giữ nguyên, không đổi. |
| [.dockerignore](.dockerignore) | Loại `node_modules`, `target`… khỏi Docker build cho nhẹ/nhanh. |
| [.gitignore](.gitignore) | Không đẩy file rác/dữ liệu máy (`node_modules`, `dist`, `target`, `backend/data`…) lên GitHub. |

### Cơ chế "local dùng H2, online dùng Postgres"
Chìa khoá là biến môi trường **`SPRING_PROFILES_ACTIVE=prod`**:
- Trên Render có đặt biến này → Spring Boot đọc thêm `application-prod.properties` → dùng **Postgres**.
- Ở máy bạn **không** có biến này → chỉ đọc `application.properties` → dùng **H2** như cũ.

---

## 7. Biến môi trường trên Render

Do `render.yaml` tự cấu hình (bạn không phải gõ tay):

| Biến | Ý nghĩa | Nguồn |
|------|---------|-------|
| `SPRING_PROFILES_ACTIVE` | Bật chế độ prod (dùng Postgres) | đặt cố định = `prod` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | Địa chỉ database | tự lấy từ `vocab-db` |
| `DB_USER` / `DB_PASSWORD` | Tài khoản database | tự lấy từ `vocab-db` |
| `PORT` | Cổng Render cấp cho app | Render tự đặt |

> Nếu chuyển sang Neon (mục 4.3), thay nhóm `DB_*` bằng `SPRING_DATASOURCE_URL` +
> `SPRING_DATASOURCE_USERNAME` + `SPRING_DATASOURCE_PASSWORD`.

---

## 8. Chi phí & giới hạn gói Free

| | Gói Free hiện tại | Nếu nâng cấp (tham khảo) |
|---|---|---|
| Web service | 0đ, **ngủ** sau ~15p, chờ ~50s khi mở lại | ~7 USD/tháng: luôn bật, không cold start |
| Postgres | 0đ nhưng **có hạn thời gian** | trả phí theo dung lượng: giữ lâu dài |
| Băng thông/RAM | Đủ cho app học từ vựng cá nhân | Tăng theo gói |

Với nhu cầu học cá nhân/nhóm nhỏ, gói **Free là đủ** — chỉ cần lưu ý chuyện DB (mục 4.3).

---

## 9. Câu hỏi thường gặp / Xử lý sự cố

**Mở link lần đầu quay vòng ~1 phút?**
→ Bình thường (cold start, mục 4.2). Chờ chút là vào.

**Muốn app đỡ "ngủ"?**
→ Dùng dịch vụ ping miễn phí (vd UptimeRobot) gọi vào link mỗi ~10 phút để giữ thức.
Lưu ý: hơi "lách" giới hạn free và tốn giờ chạy — cân nhắc. Bền vững nhất là nâng cấp gói.

**Vào web thấy góc phải ghi "● Offline" thay vì "● Server"?**
→ Backend chưa sẵn sàng (đang cold start) hoặc DB lỗi. Chờ ~1 phút và tải lại; nếu vẫn vậy,
xem tab **Logs** trên Render tìm dòng đỏ.

**Deploy báo lỗi (Build failed)?**
→ Mở **Logs** đọc dòng lỗi. Thường do: sai cú pháp code vừa push, hoặc thiếu biến môi trường.
Sửa ở máy → `git push` lại.

**Dữ liệu bỗng mất/trở về bộ mẫu?**
→ Nhiều khả năng Postgres free đã hết hạn/bị tạo lại. Chuyển sang Neon (mục 4.3) để tránh.

**Đổi tên miền `...onrender.com` thành domain riêng?**
→ Mua domain → Render → service → **Settings** → **Custom Domains** → thêm & trỏ DNS theo hướng dẫn.

**Muốn xem/sửa dữ liệu database trực tiếp?**
→ Dùng DBeaver/pgAdmin kết nối bằng connection string của DB (lấy trong mục Databases trên Render).
   (H2 console `/h2-console` đã **tắt** trên bản online cho an toàn.)

---

## 10. Bảo mật — lưu ý

- **Không commit mật khẩu/DB** lên GitHub. Hiện thông tin DB nằm ở **biến môi trường trên Render**,
  không nằm trong code → an toàn. Giữ nguyên như vậy.
- API đang cho phép mọi nguồn gọi (`CORS *`) và **chưa có đăng nhập** — phù hợp app cá nhân.
  Nếu sau này công khai rộng, nên thêm xác thực và siết CORS.
- `application-prod.properties` chỉ chứa **tên biến** (`${DB_HOST}`…), **không** chứa giá trị thật → an toàn khi để trong repo.

---

*Cập nhật lần cuối: 09/08/2026. Mọi thao tác deploy/bảo trì xem thêm ở [DEPLOY.md](DEPLOY.md).*
