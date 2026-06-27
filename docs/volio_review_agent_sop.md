# Volio Review Reply SOP

Quy trình chuẩn cho AI agent xử lý review trên Apps Publisher Volio bằng template có sẵn.

## Mục tiêu

- Xử lý app/filter đang mở trên trang `Reviews Feed`.
- Phạm vi mặc định: tab `No replies`, rating `1`, `2`, `3`, page size `50`.
- Agent chỉ chọn template có sẵn và gửi reply; không tự viết nội dung, không dùng `Rewrite with AI`.
- Review mơ hồ hoặc quá ngắn thì skip và log, không chọn bừa.

## Trạng thái đã kiểm chứng

- Chrome extension control đã hoạt động sau khi cài Codex Chrome Extension.
- Đã gửi thành công 1 review thật:
  - User: `Kesar khan`
  - Template: `Permission Concern`
  - Kết quả: sau khi bấm `Send Message`, reply box biến mất khỏi trang.
- Batch đầy đủ chưa chạy tiếp sau điểm này vì workflow được chuyển sang viết SOP.

## Quy tắc điều khiển bắt buộc

1. Chỉ mở một reply box tại một thời điểm.
2. Nếu đã mở reply box hoặc đã chọn nhầm template, phải bấm `Cancel` trước khi chuyển review khác hoặc chọn lại theo flow sạch.
3. Không mở nhiều `Reply to Review` cùng lúc. Trang cho phép mở chồng, nhưng thao tác dễ lệch template và gửi nhầm.
4. Sau khi bấm `Send Message`, không sleep cố định 15 giây. Chờ trạng thái thật:
   - reply textarea biến mất, hoặc
   - nút `Send Message` không còn enabled, hoặc
   - review biến khỏi vùng đang xử lý.
5. Nếu sau khoảng 12 giây trạng thái chưa hoàn tất, dừng batch và log lỗi.
6. Dùng locator/DOM/text khi có thể. Chỉ dùng tọa độ sau khi đã đọc rect hiện tại của đúng element.

## Flow xử lý từng review

1. Xác nhận URL/filter:
   - `apps-publisher.volio.vn/reviews-feed`
   - query có `reply=noReply`
   - query có `rating=3,2,1` hoặc UI đang tick 1-3 sao
   - page size là `50`
2. Lấy review đầu tiên còn nút `Reply to Review` trong viewport.
3. Trích xuất:
   - username
   - rating
   - review text gốc và bản dịch trong ngoặc nếu có
   - review language
4. Phân loại intent.
5. Nếu confidence thấp hoặc text quá ngắn, log `skipped_uncertain`, scroll qua review đó.
6. Nếu chắc chắn:
   - click `Reply to Review`
   - chọn template
   - xác nhận textarea có nội dung và `Send Message` enabled
   - click `Send Message`
   - chờ trạng thái thật hoàn tất
   - log `sent`
7. Tiếp tục review kế tiếp.

## Rule chọn template

Ưu tiên theo intent cụ thể, không theo ngôn ngữ. Platform tự chuẩn hóa ngôn ngữ reply.

- Privacy/data/permission/spying/leak personal info: `Permission Concern`
- Virus/malware/unsafe/security warning: `Virus Problem`
- Ads/commercial/quảng cáo/anuncios/reklam: `Remove Ads 3`
- Crash/error/not working/not opening/not loading/install failed: `Technical Issue`
- Slow/lag/freeze/battery/hot/performance: `Performance Issue`
- Không biết cách dùng/không hiểu/hỏi cách làm: `Usage Help`
- Thiếu nội dung/paywall/search không ra thứ muốn có: `Missing Content`
- Khen app nhưng rating thấp: `Rating Mismatch`
- Chê chung 1 sao không rõ vấn đề: `General 1 star`
- Rating thấp cần thêm chi tiết, không có intent rõ: `Need Details`

Nếu review chứa nhiều intent, ưu tiên:

1. `Permission Concern`
2. `Virus Problem`
3. `Remove Ads 3`
4. `Technical Issue`
5. `Performance Issue`
6. Các fallback còn lại

Ví dụ: review có cả “leak personal information” và “too many ads” thì chọn `Permission Concern`, không chọn ads.

## Template ẩn trong nút `...`

Các template quick hiện ngay trong reply box gồm:

- `General 1 star`
- `Need Details`
- `Virus Problem`
- `Technical Issue`
- `Usage Help`
- `Improve Note`
- `Rating Mismatch`
- `Missing Content`
- `Setup Feedback`
- `Permission Concern`

`Remove Ads 3` không nằm ở hàng quick. Cách chọn:

1. Click nút icon `...` trong reply box hiện tại.
2. Modal `Saved Replies` mở ra.
3. Mở folder `Remove Ads` bằng nút `Toggle`.
4. Click đúng row `Remove Ads 3`, ưu tiên click giữa row thay vì mé trái.
5. Xác nhận modal đóng, textarea có nội dung ads reply, `Send Message` enabled.

## Logging

Mỗi review cần log các field:

- `batch_id`
- `timestamp`
- `username`
- `rating`
- `review_language`
- `review_text`
- `detected_intent`
- `template`
- `confidence`
- `status`
- `reason`
- `error`

Status chuẩn:

- `selecting`
- `sending`
- `sent`
- `skipped_uncertain`
- `failed`

## Failure handling

- Không tìm thấy nút template quick: dừng review hiện tại, `Cancel`, log `failed`.
- Modal `Saved Replies` không mở hoặc không thấy `Remove Ads 3`: `Cancel`, log `failed`.
- Sau khi chọn template mà textarea rỗng hoặc `Send Message` disabled: `Cancel`, log `failed`.
- Sau khi gửi mà trạng thái không hoàn tất trước timeout: dừng batch, không gửi tiếp.
- Nếu Chrome control mất tab, claim lại đúng tab Volio rồi đọc trạng thái trước khi tiếp tục.

## Không được làm

- Không bấm `Rewrite with AI`.
- Không tự type/sửa nội dung reply.
- Không gửi review đã skip.
- Không mở nhiều reply box.
- Không click theo tọa độ cũ sau khi scroll hoặc sau khi template đổi layout.
- Không gửi hàng loạt nếu chưa xác nhận filter đang là `No replies`.
