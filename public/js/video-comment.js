function formatTimeAgo(dateString) {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const hours = created.getHours().toString().padStart(2, '0');
  const mins = created.getMinutes().toString().padStart(2, '0');
  return `Hôm nay lúc ${hours}:${mins}`;
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
