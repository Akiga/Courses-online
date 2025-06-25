document.addEventListener("DOMContentLoaded", function () {
    // Dropdown tài khoản (nếu có)
    const showDropdown = document.getElementById('showDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (showDropdown && dropdownMenu) {
      showDropdown.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
      });
      document.addEventListener('click', function (e) {
        if (!dropdownMenu.contains(e.target) && !showDropdown.contains(e.target)) {
          dropdownMenu.classList.remove('show');
        }
      });
    }

    // Modal chat với admin (ssm)
    const ssmOpenChat = document.getElementById('ssmOpenChatModal');
    if (ssmOpenChat) {
      ssmOpenChat.addEventListener('click', function (e) {
        e.preventDefault();
        const ssmChatModal = new bootstrap.Modal(document.getElementById('ssmChatModal'));
        ssmChatModal.show();
      });
    }

    // Xử lý gửi tin nhắn (giả lập)
    const ssmChatForm = document.getElementById('ssmChatForm');
    const ssmChatInput = document.getElementById('ssmChatInput');
    const ssmChatMessages = document.getElementById('ssmChatMessages');
    if (ssmChatForm && ssmChatInput && ssmChatMessages) {
      ssmChatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = ssmChatInput.value.trim();
        if (msg) {
          const div = document.createElement('div');
          div.innerHTML = `<b>Bạn:</b> ${msg}`;
          ssmChatMessages.appendChild(div);
          ssmChatInput.value = '';
          ssmChatMessages.scrollTop = ssmChatMessages.scrollHeight;
          // Giả lập phản hồi admin
          setTimeout(() => {
            const adminDiv = document.createElement('div');
            adminDiv.innerHTML = `<b>Admin:</b> Cảm ơn bạn đã liên hệ!`;
            adminDiv.style.color = "#007bff";
            ssmChatMessages.appendChild(adminDiv);
            ssmChatMessages.scrollTop = ssmChatMessages.scrollHeight;
          }, 800);
        }
      });
    }
  });
  // Login and Registration Modal
  function openModal() {
    document.getElementById("authOverlay").style.display = "flex";
  }

  function closeModal() {
    document.getElementById("authOverlay").style.display = "none";
  }

  function switchTab(tab) {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.remove('active');

    if (tab === 'login') {
      document.getElementById('loginForm').classList.add('active');
      document.getElementById('loginTab').classList.add('active');
    } else {
      document.getElementById('registerForm').classList.add('active');
      document.getElementById('registerTab').classList.add('active');
    }
  }

  function validateLogin() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const error = document.getElementById("loginError");
    error.textContent = "";

    if (!username || !password) {
      error.textContent = "Vui lòng điền đầy đủ thông tin.";
      return false;
    }

    if (username.includes(" ")) {
      error.textContent = "Tên đăng nhập không được chứa khoảng trắng.";
      return false;
    }

    if (password.length < 6) {
      error.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
      return false;
    }

    return true;
  }

  function validateRegister() {
    const fullname = document.getElementById("registerFullname").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const error = document.getElementById("registerError");
    error.textContent = "";

    if (!fullname || !username || !email || !password) {
      error.textContent = "Vui lòng điền đầy đủ thông tin.";
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = "Email không hợp lệ.";
      return false;
    }

    if (username.includes(" ")) {
      error.textContent = "Tên đăng nhập không được chứa khoảng trắng.";
      return false;
    }

    if (password.length < 6) {
      error.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
      return false;
    }

    return true;
  }

  function handleCredentialResponse(response) {
    const jwt = response.credential;
    // Giải mã nếu cần, hoặc gửi đến backend xử lý
    console.log("Google ID Token:", jwt);

    alert("Đăng nhập Google thành công!\n(Google JWT token được log ở console.)");
    
    // Tùy ý: đóng modal
    closeModal();
  }
  // Mở modal chat khi nhấn Báo cáo
  const ssopenChat = document.getElementById('openChatModal');
  if (openChat) {
    openChat.addEventListener('click', function (e) {
      e.preventDefault();
      const chatModal = new bootstrap.Modal(document.getElementById('chatModal'));
      chatModal.show();
    });
  }


// thu gọn, mở rộng
  document.querySelectorAll('.xem-them').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById(btn.dataset.target);
      if (target) {
        target.classList.remove('line-clamp');
        btn.style.display = 'none';
      }
    });
  });
  function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
          toast.classList.add('show');
      }, 100);
      
      setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
              toast.remove();
          }, 500);
      }, 5000);
  }

  function showToastErr(message) {
      const toast = document.createElement('div');
      toast.className = 'toastErr';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
          toast.classList.add('show');
      }, 100);
      
      setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
              toast.remove();
          }, 500);
      }, 5000);
  }