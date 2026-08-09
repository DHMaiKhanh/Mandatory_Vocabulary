# Đưa VocabMaster lên mạng (Render — miễn phí)

Mục tiêu: có **một đường link công khai** kiểu `https://vocabmaster.onrender.com`,
dùng được trên mọi thiết bị, **không cần localhost**.

Cách này gói **frontend + backend vào chung 1 service, 1 domain** và đổi database
từ H2 (file trên máy) sang **PostgreSQL** (Render cấp miễn phí) để dữ liệu không bị
mất khi app khởi động lại.

> ⚠️ Bản miễn phí của Render có 2 điểm cần biết:
> 1. App **"ngủ"** sau ~15 phút không ai dùng → lần mở kế tiếp chờ **~1 phút** rồi chạy bình thường.
> 2. **Postgres miễn phí của Render có giới hạn thời gian** (Render hiện xoá DB free sau một thời gian).
>    Nếu muốn database miễn phí **lâu dài**, xem mục *"Dùng database free vĩnh viễn (Neon)"* ở cuối.

---

## Bước 0 — Chuẩn bị tài khoản (một lần)
1. Tài khoản **GitHub**: https://github.com (miễn phí).
2. Tài khoản **Render**: https://render.com → đăng nhập bằng GitHub cho nhanh (miễn phí).
3. Máy đã cài **Git**. Kiểm tra: mở PowerShell gõ `git --version`.
   Chưa có thì tải: https://git-scm.com/download/win

---

## Bước 1 — Đưa code lên GitHub
Mở PowerShell **tại thư mục dự án** (`Mandatory_Vocabulary_Claude`) rồi chạy lần lượt:

```powershell
git init
git add .
git commit -m "VocabMaster: chuan bi deploy len Render"
```

Tạo repo trống trên GitHub (https://github.com/new), đặt tên ví dụ `vocabmaster`,
**không** tích thêm README. Sau khi tạo, GitHub hiện dòng lệnh — copy đúng 2 dòng
dạng dưới (thay `TEN-GITHUB` bằng tên của bạn):

```powershell
git remote add origin https://github.com/TEN-GITHUB/vocabmaster.git
git branch -M main
git push -u origin main
```

Xong bước này, toàn bộ code đã nằm trên GitHub.

---

## Bước 2 — Deploy trên Render (bằng Blueprint)
File `render.yaml` trong dự án đã mô tả sẵn mọi thứ, nên rất ít thao tác:

1. Vào https://dashboard.render.com → bấm **New +** → chọn **Blueprint**.
2. Chọn repo `vocabmaster` vừa đẩy lên (lần đầu cần bấm **Connect GitHub** để cấp quyền).
3. Render đọc `render.yaml` và hiện ra: **1 web service** (`vocabmaster`) + **1 database** (`vocab-db`).
4. Bấm **Apply** / **Create**. Render sẽ:
   - Tạo database Postgres.
   - Build Docker image (build React + Spring Boot). Lần đầu mất khoảng **5–10 phút**.
   - Tự nối thông tin database vào app (các biến `DB_*`) — **bạn không phải gõ tay**.
5. Khi service chuyển trạng thái **Live** (màu xanh), bấm vào link ở đầu trang, dạng:

   **https://vocabmaster.onrender.com**  ← đây là link của bạn 🎉

Mở link đó trên điện thoại/máy khác đều vào được (nhớ: lần đầu sau khi "ngủ" chờ ~1 phút).

---

## Local vẫn chạy y như cũ
Việc deploy **không ảnh hưởng** cách chạy trên máy bạn. Vẫn:
- `run-backend.bat` + `run-frontend.bat`, hoặc `mvn spring-boot:run` và `npm run dev`.
- Máy vẫn dùng **H2** (file `backend/data/vocabdb.mv.db`) như trước.

Lý do: cấu hình Postgres chỉ bật khi có biến `SPRING_PROFILES_ACTIVE=prod`
(chỉ Render đặt biến này). Ở máy bạn không có biến đó nên vẫn dùng H2.

---

## Mỗi khi sửa code, cập nhật bản online
Chỉ cần đẩy code mới lên GitHub, Render **tự build lại**:

```powershell
git add .
git commit -m "mo ta thay doi"
git push
```

---

## (Tuỳ chọn) Dùng database free VĨNH VIỄN — Neon
Nếu không muốn lo Postgres free của Render hết hạn, dùng **Neon** (https://neon.tech,
Postgres miễn phí, không hết hạn):

1. Tạo project trên Neon → nó cho một **connection string** dạng:
   `postgresql://user:pass@ep-xxx.neon.tech/dbname`
2. Trên Render, mở service `vocabmaster` → tab **Environment**, **xoá** 5 biến `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`
   và thêm 3 biến sau (lấy từ chuỗi của Neon):
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://ep-xxx.neon.tech/dbname?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `user`
   - `SPRING_DATASOURCE_PASSWORD` = `pass`
3. Trong `render.yaml` có thể bỏ khối `databases:` nếu không dùng DB của Render nữa.

> App đọc datasource qua biến môi trường chuẩn của Spring nên đổi nhà cung cấp DB
> chỉ là đổi giá trị biến, **không cần sửa code**.

---

## (Tuỳ chọn) Gắn domain riêng đẹp
Muốn link kiểu `vocabmaster.com` thay cho `...onrender.com`:
1. Mua domain (Namecheap, Porkbun, hoặc nhà cung cấp VN…).
2. Trên Render: service → **Settings** → **Custom Domains** → thêm domain, làm theo hướng dẫn trỏ DNS.
