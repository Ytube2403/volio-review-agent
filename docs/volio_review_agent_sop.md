# Volio Review Reply SOP

Quy trình chuẩn cho AI agent xử lý review trên Apps Publisher Volio bằng template có sẵn.

## Mục tiêu

- Xử lý app/filter đang mở trên trang `Reviews Feed`.
- Phạm vi mặc định: tab `No replies`, rating `1`, `2`, `3`, page size `50`.
- Agent chỉ chọn template có sẵn và gửi reply; không tự viết nội dung, không dùng `Rewrite with AI`.
- Review mơ hồ hoặc quá ngắn thì skip và log, không chọn bừa.

## Trạng thái đã kiểm chứng

- Chrome extension control hoạt động sau khi cài Codex Chrome Extension.
- Đã gửi thành công review thật với các template:
  - `Kesar khan`: `Permission Concern`
  - `Koko Karouma`: `General 1 star`
  - `Gggh`: đã gửi trong lượt trước, nhưng sau khi rà lại folder thì case khen app/rating thấp nên ưu tiên chuẩn là `Rating Mismatch`.
- Filter `No replies`/`All reviews` có thể vẫn hiển thị card đã có reply. Phải skip card đã có reply block hiện hữu, ví dụ block chứa `@volio.group`.
- `Rating Mismatch` đã được xác nhận nằm trong folder `Review không liên quan`.

## Quy tắc điều khiển bắt buộc

1. Chỉ mở một reply box tại một thời điểm.
2. Nếu đã mở reply box hoặc đã chọn nhầm template, phải bấm `Cancel` trước khi chuyển review khác hoặc chọn lại.
3. Không mở nhiều `Reply to Review` cùng lúc.
4. Sau khi bấm `Send Message`, không sleep cố định 15 giây. Chờ trạng thái thật: reply textarea biến mất, nút gửi hoàn tất, hoặc review biến khỏi vùng đang xử lý.
5. Nếu sau khoảng 12 giây trạng thái chưa hoàn tất, dừng batch và log lỗi.
6. Dùng locator/DOM/text khi có thể. Chỉ dùng tọa độ sau khi đã đọc rect hiện tại của đúng element.

## Flow xử lý từng review

1. Xác nhận URL/filter:
   - `apps-publisher.volio.vn/reviews-feed`
   - query có `reply=noReply`
   - query/UI đang lọc rating `1`, `2`, `3`
   - page size là `50`
2. Lấy review đầu tiên còn nút `Reply to Review` trong viewport.
3. Nếu card đã có reply block từ `@volio.group` hoặc nội dung phản hồi cũ, log `skipped_already_replied` và bỏ qua.
4. Trích xuất username, rating, review text gốc/bản dịch, review language.
5. Phân loại intent và xác định template/folder trước khi click.
6. Nếu confidence thấp hoặc text quá ngắn, log `skipped_uncertain`, scroll qua review đó.
7. Nếu chắc chắn:
   - click `Reply to Review`
   - chọn template quick nếu thấy đúng tên
   - nếu không thấy quick, click `...`, mở đúng folder theo bảng dưới, rồi chọn row template
   - xác nhận textarea có nội dung và `Send Message` enabled
   - click `Send Message`
   - chờ trạng thái thật hoàn tất
   - log `sent`

## Rule chọn template

Ưu tiên theo intent cụ thể, không theo ngôn ngữ. Platform tự chuẩn hóa ngôn ngữ reply.

- Privacy/data/permission/spying/leak personal info: `Permission Concern`
- Virus/malware/unsafe/security warning: `Virus Problem`
- Ads/commercial/quảng cáo/anuncios/reklam: `Remove Ads 3`
- Crash/error/not working/not opening/not loading/install failed: `Technical Issue`
- Slow/lag/freeze/battery/hot/performance: `Performance Issue`
- Không biết cách dùng/setup/permission setup: `Usage Help`
- Thiếu nội dung/tính năng/search không ra thứ muốn có: `Missing Content`
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

## Folder Template Đã Xác Nhận

Nguồn xác nhận: ảnh trong folder `D:\Kimi\Review`.

| Folder UI | Template trong folder |
| --- | --- |
| `Review không liên quan` | `Usage Help`, `Improve Note`, `Need Details`, `Rating Mismatch`, `Not Good`, `Không liên quan 1` |
| `Technical Issue Response` | `Virus Problem`, `Technical Issue`, `Permission Concern`, `Technical Issue Thanks`, `Technical Issue Fixed`, `Performance Issue` |
| `User chê app` | `General 1 star`, `Xin lỗi & Cam kết cải thiện`, `Xin lỗi và Hỗ trợ kỹ thuật`, `Xin lỗi và cam kết cập nhật` |
| `User góp ý` | `Missing Content`, `Setup Feedback`, `Star Upgrade`, `Positive but Ads Feedback` |
| `User khen app` | `User Love`, `Great App 2`, `Great user taste`, `Great App`, `Khen ngợi - Phản hồi nhiệt tình`, `Phản hồi thân thiện`, `Phản hồi đáng yêu 1`, `Phản hồi đáng yêu 2` |
| `Remove Ads` | `Remove Ads 3`, `remove ads 2`, `Quảng cáo - Remove ad`, `Reply_4Star_Ads_Option3` |
| `5 sao` | `Phản hồi 5 sao - Nhiều Icon (2)`, `cảm ơn sâu sắc`, `mời quay lại dùng tiếp`, `ghi nhận góp ý (nếu có)`, `5 sao (2)`, `Phản hồi 5 sao 1` |

Mapping active trong `review_rules.json`:

- `Rating Mismatch`, `Need Details`, `Usage Help`: folder `Review không liên quan`
- `Permission Concern`, `Virus Problem`, `Technical Issue`, `Performance Issue`: folder `Technical Issue Response`
- `General 1 star`: folder `User chê app`
- `Missing Content`: folder `User góp ý`
- `Remove Ads 3`: folder `Remove Ads`

## Chọn Template Qua Nút `...`

Khi template không hiện ở hàng quick:

1. Click icon `...` trong reply box hiện tại.
2. Trong modal `Saved Replies`, mở đúng folder theo bảng trên.
3. Click đúng row template, ưu tiên click giữa row thay vì mé trái.
4. Xác nhận modal đóng, textarea có nội dung reply phù hợp, `Send Message` enabled.

Case quan trọng:

- `Remove Ads 3`: mở folder `Remove Ads`.
- `Rating Mismatch`: mở folder `Review không liên quan`, rồi chọn `Rating Mismatch`.
- `Permission Concern`: mở folder `Technical Issue Response` nếu không thấy quick button.

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
- `folder`
- `confidence`
- `status`
- `reason`
- `error`

Status chuẩn:

- `selecting`
- `sending`
- `sent`
- `skipped_uncertain`
- `skipped_already_replied`
- `failed`

## Failure Handling

- Không tìm thấy template quick: mở `...` và dùng folder map.
- Modal `Saved Replies` không mở hoặc không thấy folder/template: `Cancel`, log `failed`.
- Sau khi chọn template mà textarea rỗng hoặc `Send Message` disabled: `Cancel`, log `failed`.
- Sau khi gửi mà trạng thái không hoàn tất trước timeout: dừng batch, không gửi tiếp.
- Nếu Chrome control mất tab, claim lại đúng tab Volio rồi đọc trạng thái trước khi tiếp tục.

## Không Được Làm

- Không bấm `Rewrite with AI`.
- Không tự type/sửa nội dung reply.
- Không gửi review đã skip.
- Không reply lại card đã có reply block.
- Không mở nhiều reply box.
- Không click theo tọa độ cũ sau khi scroll hoặc sau khi template đổi layout.
- Không gửi hàng loạt nếu chưa xác nhận filter đang là `No replies`.
