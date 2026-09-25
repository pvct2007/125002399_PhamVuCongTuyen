/* ===== CHUYỂN CHẾ ĐỘ SÁNG / TỐI ===== */

const themeButton = document.getElementById("theme-button");

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);

  themeButton.textContent = isDark
    ? "☀️ Chế độ sáng"
    : "🌙 Chế độ tối";

  themeButton.setAttribute("aria-pressed", String(isDark));
}

// Khôi phục chế độ đã chọn trước đó.
try {
  const savedTheme = localStorage.getItem("hien-theme");
  applyTheme(savedTheme === "dark");
} catch {
  applyTheme(false);
}

themeButton.addEventListener("click", function () {
  const isDark = !document.body.classList.contains("dark");

  applyTheme(isDark);

  // Lưu lựa chọn nếu trình duyệt cho phép.
  try {
    localStorage.setItem(
      "hien-theme",
      isDark ? "dark" : "light"
    );
  } catch {
    // Vẫn chuyển chế độ bình thường nếu không lưu được.
  }
});

/* ===== FORM ĐẶT BÀN ===== */

const form = document.getElementById("booking-form");
const fullnameInput = document.getElementById("fullname");
const phoneInput = document.getElementById("phone");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const result = document.getElementById("result");

// Dùng JavaScript để kiểm tra và hiển thị lỗi khi gửi form.
form.noValidate = true;

// Lấy ngày hiện tại theo múi giờ của thiết bị.
function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Không cho chọn ngày trong quá khứ.
dateInput.min = getToday();

function clearErrors() {
  for (const element of form.elements) {
    if (typeof element.setCustomValidity === "function") {
      element.setCustomValidity("");
    }
  }
}

// Xóa lỗi cũ khi người dùng sửa thông tin.
form.addEventListener("input", function (event) {
  if (typeof event.target.setCustomValidity === "function") {
    event.target.setCustomValidity("");
  }

  // Ngày và giờ có liên quan đến nhau.
  if (event.target === dateInput || event.target === timeInput) {
    timeInput.setCustomValidity("");
  }

  result.hidden = true;
});

// Xử lý nút Đặt bàn.
form.addEventListener("submit", function (event) {
  event.preventDefault();

  clearErrors();
  dateInput.min = getToday();

  const fullname = fullnameInput.value.trim();

  // Loại bỏ khoảng trắng, dấu ngoặc, dấu chấm và dấu gạch.
  const phone = phoneInput.value.replace(/[\s().-]/g, "");

  // Kiểm tra họ tên.
  if (fullname.length < 2) {
    fullnameInput.setCustomValidity(
      "Vui lòng nhập họ và tên có ít nhất 2 ký tự."
    );
  }

  // Số điện thoại: 10 chữ số bắt đầu bằng 0,
  // hoặc +84 rồi đến 9 chữ số.
const phonePattern = /^(0\d{9}|\+84\d{9})$/;

  if (!phonePattern.test(phone)) {
    phoneInput.setCustomValidity(
      "Nhập số điện thoại gồm 10 chữ số hoặc bắt đầu bằng +84."
    );
  }

  // Kiểm tra thời gian đã qua.
  if (dateInput.value && timeInput.value) {
    const arrival = new Date(
      `${dateInput.value}T${timeInput.value}`
    );

    if (arrival <= new Date()) {
      timeInput.setCustomValidity(
        "Vui lòng chọn ngày và giờ trong tương lai."
      );
    }
  }

  // Kiểm tra các điều kiện HTML:
  // required, min, max, minlength và lỗi tùy chỉnh.
  if (!form.reportValidity()) {
    return;
  }

  const data = new FormData(form);

  const guests = data.get("guests");
  const branch = data.get("branch");
  const area = data.get("area");
  const extras = data.getAll("extras");
  const notes = String(data.get("notes") || "").trim();

  const displayDate = dateInput.value
    .split("-")
    .reverse()
    .join("/");

  // Dùng textContent để dữ liệu nhập không bị hiểu thành HTML.
  result.textContent = [
    "ĐÃ KIỂM TRA THÔNG TIN MẪU",
    "",
    `Họ và tên: ${fullname}`,
    `Điện thoại: ${phone}`,
    `Ngày đến: ${displayDate}`,
    `Giờ đến: ${timeInput.value}`,
    `Số người: ${guests}`,
    `Chi nhánh: ${branch}`,
    `Khu vực: ${area}`,
    `Yêu cầu thêm: ${extras.length ? extras.join(", ") : "Không"}`,
    `Ghi chú: ${notes || "Không"}`,
    "",
    "Đây là bản minh họa. Thông tin không được gửi đi và chưa có bàn nào được đặt."
  ].join("\n");

  result.hidden = false;
  result.focus();
});

// Nút Hủy đưa form về giá trị ban đầu.
form.addEventListener("reset", function () {
  clearErrors();

  result.hidden = true;
  result.textContent = "";

  dateInput.min = getToday();
});