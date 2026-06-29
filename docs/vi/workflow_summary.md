# Tóm Tắt Quy Trình Vận Hành

Tài liệu này là bản tóm tắt tiếng Việt cho người thiết kế và người quản lý sản
phẩm. Agent nên đọc bản tiếng Anh trong `docs/volio_review_agent_sop.md`.

Nếu cần cài đặt từ đầu, xem tài liệu tiếng Anh `docs/setup.md`.

## 1. Mở Đúng Tab Volio

Người vận hành cần mở đúng trang `Reviews Feed` của app cần xử lý. Mặc định nên
là filter `No replies`, đúng app ID, đúng rating/page size theo mục tiêu batch.

## 2. Scrape Review

Agent đọc danh sách review hiện tại trên UI và lưu vào:

```text
apps/<app>/logs/reviews_scraped.json
```

## 3. Phân Loại

Agent hoặc subagent đọc review gốc, xác định intent, và chọn template phù hợp.
Kết quả lưu vào:

```text
apps/<app>/logs/reviews_classified.json
```

## 4. Validate

Trước khi gửi, hệ thống kiểm tra:

- Template có nằm trong rule hợp lệ không.
- Folder template có đúng không.
- Review có warning/guardrail không.
- Intent có bị lệch với nội dung review không.

Nếu có lỗi hoặc warning chưa được duyệt, không gửi.

## 5. Gửi Reply

Agent điều khiển Chrome qua Kimi WebBridge. Mỗi lần chỉ mở một reply box, chọn
template, xác nhận nội dung đã điền vào textarea, rồi mới bấm gửi.

## 6. Reconcile

Sau khi chạy, Agent đọc lại UI và so sánh với log. Mục tiêu là không có review
có thể trả lời nào bị bỏ sót mà không có lý do.

## 7. Báo Cáo Cuối

Báo cáo cuối cần có:

- Số reply đã gửi.
- Số review đã skip.
- Số lỗi thật sự.
- Số review còn lại trên UI.
- Lý do của từng review còn lại nếu có.

## Ghi Nhớ

Nếu Kimi Bridge báo lỗi `session has no tab`, thường không phải bridge chết.
Đó là session của Agent chưa bind vào tab Chrome đang mở. Cần bind lại tab trước
khi tiếp tục.
