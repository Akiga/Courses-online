function formatTimeAgo(dateString) {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Kiểm tra nếu bình luận trong vòng 1 phút
  if (diffMins < 1) return 'Vừa xong';
  // Kiểm tra nếu bình luận trong vòng 60 phút
  if (diffMins < 60) return `${diffMins} phút trước`;

  const hours = created.getHours().toString().padStart(2, '0');
  const mins = created.getMinutes().toString().padStart(2, '0');

  // Kiểm tra nếu bình luận trong cùng ngày
  const isSameDay = now.getDate() === created.getDate() &&
                    now.getMonth() === created.getMonth() &&
                    now.getFullYear() === created.getFullYear();

  if (isSameDay) {
    return `Hôm nay lúc ${hours}:${mins}`;
  }

  // Nếu không cùng ngày, hiển thị ngày tháng
  const day = created.getDate().toString().padStart(2, '0');
  const month = (created.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
  const year = created.getFullYear();
  return `${day}/${month}/${year} lúc ${hours}:${mins}`;
}



document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendComment');
  const commentInput = document.getElementById('commentInput');
  const commentList = document.getElementById('commentList');
  const videoId = document.getElementById('videoId').value;

  const renderComment = (c) => {
  const el = document.createElement('div');
  el.className = 'video-comment-item';
  const timeStr = formatTimeAgo(c.createdAt);
  el.innerHTML = `<strong>${c.userId.fullname}</strong> <small style="color:#888">(${timeStr})</small><br>${c.content}`;
  commentList.prepend(el);
};

  // Gửi bình luận
  sendBtn.addEventListener('click', async () => {
    const content = commentInput.value.trim();
    if (!content) return;

    const res = await fetch('/comment/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, videoId })
    });

    const data = await res.json();
    if (data.success) {
      renderComment(data.comment);
      commentInput.value = '';
    } else {
      alert('Lỗi khi gửi bình luận');
    }
  });

  // Lấy bình luận ban đầu
  fetch(`/comment/video/${videoId}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(renderComment);
    });
});
