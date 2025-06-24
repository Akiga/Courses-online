// Lưu đăng nhập
module.exports = function(req, res, next) {
  res.locals.account = req.session.account || null;
  next();
};

// Phân quyền
module.exports.requireAdmin = function (req, res, next) {
  if (req.session.account && req.session.account.role === 'admin') {
    return next();
  }
  return res.status(403).send('Không có quyền truy cập.');
};

