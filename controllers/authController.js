const Admin = require('../models/Admin');

exports.loginForm = (req, res) => {
  res.render('admin/login', { title: 'Đăng nhập quản trị', error: null, layout: false });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: (email || '').toLowerCase().trim() });
  if (!admin || !(await admin.checkPassword(password || ''))) {
    return res.status(401).render('admin/login', {
      title: 'Đăng nhập quản trị',
      error: 'Email hoặc mật khẩu không đúng.',
      layout: false
    });
  }
  req.session.adminId = String(admin._id);
  req.session.adminName = admin.name;
  res.redirect('/admin');
};

exports.logout = (req, res) => {
  req.session.adminId = null;
  req.session.adminName = null;
  res.redirect('/admin/login');
};
