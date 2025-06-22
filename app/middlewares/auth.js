module.exports = function(req, res, next) {
  res.locals.account = req.session.account || null;
  res.locals.successMessage = req.session.successMessage || null;

    // Xóa sau khi hiển thị để tránh hiển thị lại
    delete req.session.successMessage;
  next();
};
module.exports.requireAdmin = function (req, res, next) {
  if (req.session.account && req.session.account.role === 'admin') {
    return next();
  }
  return res.status(403).send('Không có quyền truy cập.');
};

