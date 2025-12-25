import { Language, Platform, Activity } from './types';

// Default Fallback
export const TELEGRAM_LINK = "https://t.me/betbounty_official";

export const LANGUAGES: Record<Language, { label: string; flag: string; currency: string; rate: number }> = {
  en: { label: 'English', flag: '🇺🇸', currency: '$', rate: 1 }, 
  zh: { label: '中文', flag: '🇨🇳', currency: '¥', rate: 1 },
  id: { label: 'Indonesia', flag: '🇮🇩', currency: 'Rp', rate: 1 },
  th: { label: 'ไทย', flag: '🇹🇭', currency: '฿', rate: 1 },
  vi: { label: 'Tiếng Việt', flag: '🇻🇳', currency: '₫', rate: 1 },
  ms: { label: 'Melayu', flag: '🇲🇾', currency: 'RM', rate: 1 },
  tl: { label: 'Pilipino', flag: '🇵🇭', currency: '₱', rate: 1 },
};

export const BANK_OPTIONS: Record<string, { name: string; type: 'bank' | 'ewallet' }[]> = {
  id: [
    { name: 'BCA', type: 'bank' }, { name: 'Mandiri', type: 'bank' }, { name: 'BRI', type: 'bank' },
    { name: 'DANA', type: 'ewallet' }, { name: 'OVO', type: 'ewallet' }, { name: 'GoPay', type: 'ewallet' }
  ],
  th: [
    { name: 'KBANK', type: 'bank' }, { name: 'SCB', type: 'bank' }, { name: 'Bangkok Bank', type: 'bank' },
    { name: 'TrueMoney', type: 'ewallet' }
  ],
  vi: [
    { name: 'Vietcombank', type: 'bank' }, { name: 'Techcombank', type: 'bank' }, { name: 'MB Bank', type: 'bank' },
    { name: 'Momo', type: 'ewallet' }, { name: 'ZaloPay', type: 'ewallet' }
  ],
  ms: [
    { name: 'Maybank', type: 'bank' }, { name: 'CIMB', type: 'bank' }, { name: 'Public Bank', type: 'bank' },
    { name: 'Touch n Go', type: 'ewallet' }, { name: 'GrabPay', type: 'ewallet' }
  ],
  tl: [
    { name: 'BDO', type: 'bank' }, { name: 'BPI', type: 'bank' }, { name: 'Metrobank', type: 'bank' },
    { name: 'GCash', type: 'ewallet' }, { name: 'Maya', type: 'ewallet' }
  ],
  zh: [
    { name: '银行卡', type: 'bank' }, { name: '支付宝', type: 'ewallet' }, { name: '微信支付', type: 'ewallet' }
  ],
  en: [
    { name: 'Bank Transfer', type: 'bank' }, { name: 'PayPal', type: 'ewallet' }, { name: 'USDT (TRC20)', type: 'ewallet' }
  ]
};

export const TRANSLATIONS = {
  en: {
    home: 'Home', earn: 'Earn', tasks: 'Tasks', profile: 'Me', referral: 'Invite', login: 'Login', register: 'Register', merchantLogin: 'Operations Portal',
    phone: 'Phone Number', password: 'Password', username: 'Username', verifyCode: 'SMS Code', getCode: 'Get Code', appName: 'OddsHub',
    balance: 'Balance', withdraw: 'Withdraw', bindCard: 'Add Account', totalEarnings: 'Total Earnings', submitProof: 'Submit Proof',
    uploadScreenshot: 'Upload Screenshot', audit: 'Audit', approve: 'Approve', reject: 'Reject',
    status: { ongoing: 'To Do', reviewing: 'Reviewing', completed: 'Completed', rejected: 'Rejected' },
    adminTabs: { users: 'Users', tasks: 'Tasks', activities: 'Activities', audit: 'Task Audit', admins: 'Admins', config: 'System', messages: 'Messages' },
    sort: 'Sort', sortNew: 'Newest', sortReward: 'Reward', sortDeposit: 'Deposit', startTask: 'Join Now', steps: 'Steps', rules: 'Rules',
    uploadPlatform: 'Publish Task', hot: 'HOT', reward: 'Reward', remaining: 'Left', activityTitle: 'Special Event', play: 'Go Now',
    wait: 'Wait', sent: 'Sent', submit: 'Submit', myTasksTitle: 'My Tasks', noTasks: 'No tasks found', scanQr: 'Scan to Join',
    shareCode: 'My Referral Code', shareLink: 'Share Link', copy: 'Copy', copied: 'Copied!', messages: 'Messages', notifications: 'Notifications',
    telegram: 'Channel', referralRules: '3-Level Commission', referralDesc: 'Invite friends and earn passive income forever.',
    level1: 'Level 1 (20%)', level2: 'Level 2 (10%)', level3: 'Level 3 (5%)',
    bankName: 'Bank / Wallet', accHolder: 'Account Name', accNumber: 'Account No. / Phone',
    save: 'Save', cancel: 'Cancel', activityName: 'Activity Title', targetCountry: 'Target Country', uploadImage: 'Upload Image',
    addActivity: 'Add Activity', activityContent: 'Activity Content', createTask: 'Create New Task', taskName: 'Task Name',
    taskDesc: 'Description', taskRules: 'Rules', taskReward: 'Reward Amount', taskLink: 'Product Link (URL)', example: 'Example',
    inviteCode: 'Invite Code (Optional)', backToApp: 'Back to App', createAdmin: 'Create Admin', adminRole: 'Role',
    transactions: 'Transactions', amount: 'Amount', type: 'Type', date: 'Date', sysConfig: 'System Config',
    initBalance: 'New User Bonus', minWithdraw: 'Min Withdraw', sendMsg: 'Send Message', title: 'Title', content: 'Content',
    send: 'Send', todayStats: 'Today\'s Stats', totalInvited: 'Total Team', comms: 'Commissions',
    walletType: 'Type', confirmWithdraw: 'Confirm Withdraw', insufficient: 'Insufficient Balance', minWithdrawErr: 'Minimum withdraw is',
    selectAccount: 'Select Account', addAccount: 'Add New Account', shareVia: 'Share via',
    howItWorks: 'How it Works', 
    refStoryA: 'You invite A', refStoryB: 'A invites B', refStoryC: 'B invites C', 
    refStoryEarn: 'You earn', refExample: 'Example: If user completes a $100 task'
  },
  zh: {
    home: '首页', earn: '赚钱', tasks: '任务', profile: '个人中心', referral: '邀请好友', login: '登录', register: '注册', merchantLogin: '运营后台登录',
    phone: '手机号码', password: '登录密码', username: '后台账号', verifyCode: '短信验证码', getCode: '获取验证码', appName: 'OddsHub',
    balance: '可提现余额', withdraw: '申请提现', bindCard: '添加收款账号', totalEarnings: '累计收益', submitProof: '提交凭证',
    uploadScreenshot: '上传充值截图', audit: '审核管理', approve: '通过', reject: '拒绝',
    status: { ongoing: '进行中', reviewing: '审核中', completed: '已完成', rejected: '已拒绝' },
    adminTabs: { users: '用户管理', tasks: '任务发布', activities: '活动管理', audit: '任务审核', admins: '后台账号', config: '系统配置', messages: '消息推送' },
    sort: '排序', sortNew: '最新', sortReward: '高奖励', sortDeposit: '低门槛', startTask: '立即参与', steps: '任务步骤', rules: '活动规则',
    uploadPlatform: '发布任务', hot: '热门', reward: '奖励', remaining: '剩余', activityTitle: '热门活动', play: '去看看',
    wait: '请稍候', sent: '已发送', submit: '提交', myTasksTitle: '我的任务', noTasks: '暂无任务', scanQr: '扫码加入',
    shareCode: '我的邀请码', shareLink: '分享链接', copy: '复制', copied: '已复制', messages: '站内信', notifications: '消息通知',
    telegram: '官方频道', referralRules: '三级分销 无限返利', referralDesc: '邀请好友赚取佣金，坐享其成。',
    level1: '一级 (20%)', level2: '二级 (10%)', level3: '三级 (5%)',
    bankName: '选择银行/钱包', accHolder: '姓名', accNumber: '卡号/手机号',
    save: '保存', cancel: '取消', activityName: '活动标题', targetCountry: '目标国家', uploadImage: '上传活动图',
    addActivity: '发布新活动', activityContent: '活动详情', createTask: '发布新任务', taskName: '任务名称',
    taskDesc: '简单描述', taskRules: '详细规则', taskReward: '奖励金额', taskLink: '产品链接', example: '举例说明',
    inviteCode: '邀请码 (选填)', backToApp: '返回APP', createAdmin: '创建管理员', adminRole: '角色',
    transactions: '资金明细', amount: '金额', type: '类型', date: '时间', sysConfig: '系统参数配置',
    initBalance: '新用户注册赠送', minWithdraw: '最低提现金额', sendMsg: '发送站内信', title: '标题', content: '内容',
    send: '发送', todayStats: '今日数据', totalInvited: '团队总人数', comms: '佣金收入',
    walletType: '账号类型', confirmWithdraw: '确认提现', insufficient: '余额不足', minWithdrawErr: '最低提现金额为',
    selectAccount: '选择收款账户', addAccount: '添加新账户', shareVia: '分享至',
    howItWorks: '收益演示',
    refStoryA: '你邀请了 A', refStoryB: 'A 邀请了 B', refStoryC: 'B 邀请了 C',
    refStoryEarn: '你获得', refExample: '举例：当下线完成 100元 任务'
  },
  id: {
     home: 'Beranda', earn: 'Hasilkan', tasks: 'Tugas', profile: 'Saya', referral: 'Undang', login: 'Masuk', register: 'Daftar', merchantLogin: 'Portal Operasi',
     phone: 'Nomor HP', password: 'Kata Sandi', username: 'Nama Pengguna', verifyCode: 'Kode SMS', getCode: 'Dapatkan Kode', appName: 'OddsHub',
     balance: 'Saldo', withdraw: 'Tarik', bindCard: 'Tambah Akun', totalEarnings: 'Total Pendapatan', submitProof: 'Kirim Bukti',
     uploadScreenshot: 'Unggah Bukti', audit: 'Audit', approve: 'Setuju', reject: 'Tolak',
     status: { ongoing: 'Berjalan', reviewing: 'Ditinjau', completed: 'Selesai', rejected: 'Ditolak' },
     adminTabs: { users: 'Pengguna', tasks: 'Tugas', activities: 'Aktivitas', audit: 'Audit Tugas', admins: 'Admin', config: 'Sistem', messages: 'Pesan' },
     sort: 'Urutkan', sortNew: 'Terbaru', sortReward: 'Hadiah', sortDeposit: 'Depo Rendah', startTask: 'Gabung Sekarang', steps: 'Langkah', rules: 'Aturan',
     uploadPlatform: 'Unggah', hot: 'PANAS', reward: 'Hadiah', remaining: 'Sisa', activityTitle: 'Acara', play: 'Main',
     wait: 'Tunggu', sent: 'Terkirim', submit: 'Kirim', myTasksTitle: 'Tugas Saya', noTasks: 'Tiada tugas', scanQr: 'Pindai QR',
     shareCode: 'Kode Referensi', shareLink: 'Bagikan Tautan', copy: 'Salin', copied: 'Disalin!', messages: 'Pesan', notifications: 'Notifikasi',
     telegram: 'Saluran', referralRules: 'Komisi 3 Tingkat', referralDesc: 'Undang teman dan dapatkan penghasilan pasif.',
     level1: 'Level 1 (20%)', level2: 'Level 2 (10%)', level3: 'Level 3 (5%)',
     bankName: 'Bank / Dompet', accHolder: 'Nama Pemilik', accNumber: 'No. Rek / HP',
     save: 'Simpan', cancel: 'Batal', activityName: 'Judul Acara', targetCountry: 'Negara Tujuan', uploadImage: 'Unggah Gambar',
     addActivity: 'Tambah Acara', activityContent: 'Konten Acara', createTask: 'Buat Tugas', taskName: 'Nama Tugas',
     taskDesc: 'Deskripsi', taskRules: 'Aturan', taskReward: 'Hadiah', taskLink: 'Tautan', example: 'Contoh',
     inviteCode: 'Kode Undangan', backToApp: 'Kembali', createAdmin: 'Buat Admin', adminRole: 'Peran',
     transactions: 'Riwayat', amount: 'Jumlah', type: 'Tipe', date: 'Tanggal', sysConfig: 'Konfigurasi Sistem',
     initBalance: 'Bonus Daftar', minWithdraw: 'Min Penarikan', sendMsg: 'Kirim Pesan', title: 'Judul', content: 'Isi',
     send: 'Kirim', todayStats: 'Statistik Hari Ini', totalInvited: 'Total Tim', comms: 'Komisi',
     walletType: 'Tipe Akun', confirmWithdraw: 'Konfirmasi Penarikan', insufficient: 'Saldo tidak cukup', minWithdrawErr: 'Min penarikan adalah',
     selectAccount: 'Pilih Akun', addAccount: 'Tambah Akun Baru', shareVia: 'Bagikan via',
     howItWorks: 'Cara Kerja',
     refStoryA: 'Anda undang A', refStoryB: 'A undang B', refStoryC: 'B undang C',
     refStoryEarn: 'Anda dapat', refExample: 'Contoh: Jika bawahan menyelesaikan tugas 100k'
  },
  th: { home: 'หน้าแรก', earn: 'รายได้', tasks: 'ภารกิจ', profile: 'ฉัน', referral: 'ชวนเพื่อน', login: 'เข้าสู่ระบบ', register: 'ลงทะเบียน', merchantLogin: 'ผู้ค้า', phone: 'เบอร์โทร', password: 'รหัสผ่าน', verifyCode: 'รหัส SMS', getCode: 'รับรหัส', appName: 'OddsHub', balance: 'ยอดเงิน', withdraw: 'ถอนเงิน', bindCard: 'ผูกบัญชี', totalEarnings: 'รายได้รวม', submitProof: 'ส่งหลักฐาน', uploadScreenshot: 'อัปโหลด', audit: 'ตรวจสอบ', approve: 'อนุมัติ', reject: 'ปฏิเสธ', status: { ongoing: 'กำลังทำ', reviewing: 'รอตรวจ', completed: 'เสร็จ', rejected: 'ไม่ผ่าน' }, adminTabs: { users: 'ผู้ใช้', tasks: 'งาน', activities: 'กิจกรรม', audit: 'ตรวจงาน', admins: 'Admin', config: 'ระบบ', messages: 'ข้อความ' }, sort: 'เรียง', sortNew: 'ใหม่', sortReward: 'รางวัล', sortDeposit: 'ฝาก', startTask: 'เข้าร่วมเลย', steps: 'ขั้นตอน', rules: 'กฎ', uploadPlatform: 'สร้างงาน', hot: 'ฮอต', reward: 'รางวัล', remaining: 'เหลือ', activityTitle: 'กิจกรรม', play: 'เล่น', wait: 'รอ', sent: 'ส่งแล้ว', submit: 'ยืนยัน', myTasksTitle: 'งานของฉัน', noTasks: 'ไม่มีงาน', scanQr: 'สแกน QR', shareCode: 'รหัสแนะนำ', shareLink: 'แชร์ลิงก์', copy: 'คัดลอก', copied: 'คัดลอกแล้ว', messages: 'ข้อความ', notifications: 'การแจ้งเตือน', telegram: 'ช่องทาง', referralRules: 'ค่าคอมมิชชั่น 3 ระดับ', referralDesc: 'เชิญเพื่อนและรับรายได้ตลอดไป', level1: 'ระดับ 1', level2: 'ระดับ 2', level3: 'ระดับ 3', bankName: 'ธนาคาร/วอลเล็ต', accHolder: 'ชื่อบัญชี', accNumber: 'เลขบัญชี/เบอร์', save: 'บันทึก', cancel: 'ยกเลิก', activityName: 'ชื่อกิจกรรม', targetCountry: 'ประเทศ', uploadImage: 'อัปโหลดรูป', addActivity: 'เพิ่มกิจกรรม', activityContent: 'เนื้อหากิจกรรม', createTask: 'สร้างงานใหม่', taskName: 'ชื่องาน', taskDesc: 'คำอธิบาย', taskRules: 'กฎ', taskReward: 'รางวัล', taskLink: 'Link', example: 'ตัวอย่าง', inviteCode: 'รหัสเชิญ', backToApp: 'กลับ', createAdmin: 'Admin', adminRole: 'Role', username: 'User', transactions: 'ประวัติ', amount: 'จำนวน', type: 'ประเภท', date: 'วันที่', sysConfig: 'ตั้งค่าระบบ', initBalance: 'โบนัสแรกเข้า', minWithdraw: 'ถอนขั้นต่ำ', sendMsg: 'ส่งข้อความ', title: 'หัวข้อ', content: 'เนื้อหา', send: 'ส่ง', todayStats: 'สถิติวันนี้', totalInvited: 'ทีมทั้งหมด', comms: 'ค่าคอมมิชชั่น', walletType: 'ประเภทบัญชี', confirmWithdraw: 'ยืนยันการถอน', insufficient: 'ยอดเงินไม่พอ', minWithdrawErr: 'ถอนขั้นต่ำคือ', selectAccount: 'เลือกบัญชี', addAccount: 'เพิ่มบัญชีใหม่', shareVia: 'แชร์ผ่าน', howItWorks: 'วิธีรับรายได้', refStoryA: 'คุณเชิญ A', refStoryB: 'A เชิญ B', refStoryC: 'B เชิญ C', refStoryEarn: 'คุณได้รับ', refExample: 'ตัวอย่าง: เมื่อลูกทีมทำงาน 100 บาท' },
  vi: { home: 'Trang chủ', earn: 'Kiếm', tasks: 'Nhiệm vụ', profile: 'Tôi', referral: 'Mời', login: 'Đăng nhập', register: 'Đăng ký', merchantLogin: 'Người bán', phone: 'SĐT', password: 'Mật khẩu', verifyCode: 'Mã SMS', getCode: 'Lấy mã', appName: 'OddsHub', balance: 'Số dư', withdraw: 'Rút tiền', bindCard: 'Thêm tài khoản', totalEarnings: 'Tổng thu nhập', submitProof: 'Nộp bằng chứng', uploadScreenshot: 'Tải ảnh', audit: 'Duyệt', approve: 'Duyệt', reject: 'Từ chối', status: { ongoing: 'Đang làm', reviewing: 'Đang duyệt', completed: 'Xong', rejected: 'Hủy' }, adminTabs: { users: 'Người dùng', tasks: 'NV', activities: 'HĐ', audit: 'Duyệt NV', admins: 'Admin', config: 'Hệ thống', messages: 'Tin nhắn' }, sort: 'Xếp', sortNew: 'Mới', sortReward: 'Thưởng', sortDeposit: 'Nạp', startTask: 'Tham gia ngay', steps: 'Bước', rules: 'Luật', uploadPlatform: 'Đăng NV', hot: 'HOT', reward: 'Thưởng', remaining: 'Còn', activityTitle: 'Sự kiện', play: 'Đi', wait: 'Chờ', sent: 'Đã gửi', submit: 'Gửi', myTasksTitle: 'NV của tôi', noTasks: 'Không có NV', scanQr: 'Quét QR', shareCode: 'Mã mời', shareLink: 'Chia sẻ', copy: 'Sao chép', copied: 'Đã sao chép', messages: 'Tin nhắn', notifications: 'Thông báo', telegram: 'Kênh', referralRules: 'Hoa hồng 3 cấp', referralDesc: 'Mời bạn bè và kiếm thu nhập thụ động.', level1: 'Cấp 1', level2: 'Cấp 2', level3: 'Cấp 3', bankName: 'Ngân hàng/Ví', accHolder: 'Tên chủ TK', accNumber: 'Số TK/SĐT', save: 'Lưu', cancel: 'Hủy', activityName: 'Tên hoạt động', targetCountry: 'Quốc gia', uploadImage: 'Tải ảnh lên', addActivity: 'Thêm hoạt động', activityContent: 'Nội dung', createTask: 'Tạo nhiệm vụ', taskName: 'Tên nhiệm vụ', taskDesc: 'Mô tả', taskRules: 'Luật', taskReward: 'Phần thưởng', taskLink: 'Link', example: 'Ví dụ', inviteCode: 'Mã mời', backToApp: 'Quay lại', createAdmin: 'Admin', adminRole: 'Role', username: 'User', transactions: 'Lịch sử', amount: 'Số tiền', type: 'Loại', date: 'Ngày', sysConfig: 'Cấu hình hệ thống', initBalance: 'Thưởng đăng ký', minWithdraw: 'Rút tối thiểu', sendMsg: 'Gửi tin nhắn', title: 'Tiêu đề', content: 'Nội dung', send: 'Gửi', todayStats: 'Thống kê hôm nay', totalInvited: 'Tổng nhóm', comms: 'Hoa hồng', walletType: 'Loại TK', confirmWithdraw: 'Xác nhận rút', insufficient: 'Số dư không đủ', minWithdrawErr: 'Rút tối thiểu là', selectAccount: 'Chọn tài khoản', addAccount: 'Thêm tài khoản', shareVia: 'Chia sẻ qua', howItWorks: 'Cách hoạt động', refStoryA: 'Bạn mời A', refStoryB: 'A mời B', refStoryC: 'B mời C', refStoryEarn: 'Bạn nhận', refExample: 'Ví dụ: Khi cấp dưới làm NV 100k' },
  ms: { home: 'Rumah', earn: 'Dapat', tasks: 'Tugas', profile: 'Saya', referral: 'Jemput', login: 'Log Masuk', register: 'Daftar', merchantLogin: 'Peniaga', phone: 'No Tel', password: 'Kata Laluan', verifyCode: 'Kod SMS', getCode: 'Dapat Kod', appName: 'OddsHub', balance: 'Baki', withdraw: 'Keluarkan', bindCard: 'Tambah Akaun', totalEarnings: 'Jumlah', submitProof: 'Hantar Bukti', uploadScreenshot: 'Muat Naik', audit: 'Audit', approve: 'Lulus', reject: 'Tolak', status: { ongoing: 'Sedang', reviewing: 'Semakan', completed: 'Selesai', rejected: 'Gagal' }, adminTabs: { users: 'Pengguna', tasks: 'Tugas', activities: 'Aktiviti', audit: 'Audit', admins: 'Admin', config: 'Sistem', messages: 'Mesej' }, sort: 'Susun', sortNew: 'Baru', sortReward: 'Ganjaran', sortDeposit: 'Depo', startTask: 'Sertai Sekarang', steps: 'Langkah', rules: 'Peraturan', uploadPlatform: 'Muat Naik', hot: 'PANAS', reward: 'Ganjaran', remaining: 'Baki', activityTitle: 'Acara', play: 'Main', wait: 'Tunggu', sent: 'Dihantar', submit: 'Hantar', myTasksTitle: 'Tugas Saya', noTasks: 'Tiada tugas', scanQr: 'Imbas QR', shareCode: 'Kod Jemputan', shareLink: 'Kongsi', copy: 'Salin', copied: 'Disalin', messages: 'Mesej', notifications: 'Notifikasi', telegram: 'Saluran', referralRules: 'Komisen 3 Tahap', referralDesc: 'Jemput rakan dan jana pendapatan pasif.', level1: 'Tahap 1', level2: 'Tahap 2', level3: 'Tahap 3', bankName: 'Bank/Dompet', accHolder: 'Nama Pemilik', accNumber: 'No Akaun', save: 'Simpan', cancel: 'Batal', activityName: 'Nama Aktiviti', targetCountry: 'Negara', uploadImage: 'Muat Naik', addActivity: 'Tambah Aktiviti', activityContent: 'Kandungan', createTask: 'Buat Tugas', taskName: 'Nama', taskDesc: 'Penerangan', taskRules: 'Peraturan', taskReward: 'Ganjaran', taskLink: 'Link', example: 'Contoh', inviteCode: 'Kod Jemputan', backToApp: 'Kembali', createAdmin: 'Admin', adminRole: 'Role', username: 'User', transactions: 'Transaksi', amount: 'Jumlah', type: 'Jenis', date: 'Tarikh', sysConfig: 'Konfigurasi Sistem', initBalance: 'Bonus Daftar', minWithdraw: 'Min Pengeluaran', sendMsg: 'Hantar Mesej', title: 'Tajuk', content: 'Kandungan', send: 'Hantar', todayStats: 'Statistik Hari Ini', totalInvited: 'Jumlah Pasukan', comms: 'Komisen', walletType: 'Jenis Akaun', confirmWithdraw: 'Sahkan Pengeluaran', insufficient: 'Baki tidak mencukupi', minWithdrawErr: 'Min pengeluaran ialah', selectAccount: 'Pilih Akaun', addAccount: 'Tambah Akaun', shareVia: 'Kongsi', howItWorks: 'Cara Berfungsi', refStoryA: 'Anda jemput A', refStoryB: 'A jemput B', refStoryC: 'B jemput C', refStoryEarn: 'Anda dapat', refExample: 'Contoh: Jika ahli buat tugas RM100' },
  tl: { home: 'Bahay', earn: 'Kita', tasks: 'Gawain', profile: 'Ako', referral: 'Imbita', login: 'Login', register: 'Register', merchantLogin: 'Merchant', phone: 'Telepono', password: 'Password', verifyCode: 'SMS Code', getCode: 'Kumuha', appName: 'OddsHub', balance: 'Balanse', withdraw: 'Withdraw', bindCard: 'Add Account', totalEarnings: 'Kabuuang Kita', submitProof: 'Ipasa', uploadScreenshot: 'Upload', audit: 'Audit', approve: 'Approve', reject: 'Reject', status: { ongoing: 'Ginagawa', reviewing: 'Review', completed: 'Tapos', rejected: 'Reject' }, adminTabs: { users: 'Users', tasks: 'Tasks', activities: 'Activities', audit: 'Audit', admins: 'Admin', config: 'System', messages: 'Messages' }, sort: 'Ayusin', sortNew: 'Bago', sortReward: 'Premyo', sortDeposit: 'Depo', startTask: 'Sumali Ngayon', steps: 'Hakbang', rules: 'Tuntunin', uploadPlatform: 'Upload', hot: 'INIT', reward: 'Gantimpala', remaining: 'Natitira', activityTitle: 'Event', play: 'Laro', wait: 'Sandali', sent: 'Naipadala', submit: 'Ipasa', myTasksTitle: 'Gawain Ko', noTasks: 'Walang gawain', scanQr: 'Scan QR', shareCode: 'Referral Code', shareLink: 'Share', copy: 'Copy', copied: 'Copied', messages: 'Messages', notifications: 'Notifications', telegram: 'Channel', referralRules: '3-Level Commission', referralDesc: 'Invite friends and earn passive income.', level1: 'Level 1', level2: 'Level 2', level3: 'Level 3', bankName: 'Bank/Wallet', accHolder: 'Account Name', accNumber: 'Account No.', save: 'Save', cancel: 'Cancel', activityName: 'Activity Name', targetCountry: 'Country', uploadImage: 'Upload Image', addActivity: 'Add Activity', activityContent: 'Content', createTask: 'Create Task', taskName: 'Name', taskDesc: 'Description', taskRules: 'Rules', taskReward: 'Reward', taskLink: 'Link', example: 'Example', inviteCode: 'Invite Code', backToApp: 'Bumalik', createAdmin: 'Admin', adminRole: 'Role', username: 'User', transactions: 'History', amount: 'Amount', type: 'Type', date: 'Date', sysConfig: 'System Config', initBalance: 'Sign-up Bonus', minWithdraw: 'Min Withdraw', sendMsg: 'Send Message', title: 'Title', content: 'Content', send: 'Send', todayStats: 'Today Stats', totalInvited: 'Total Team', comms: 'Commissions', walletType: 'Type', confirmWithdraw: 'Confirm', insufficient: 'Insufficient Balance', minWithdrawErr: 'Min withdraw is', selectAccount: 'Select Account', addAccount: 'Add Account', shareVia: 'Share', howItWorks: 'How it Works', refStoryA: 'You invite A', refStoryB: 'A invites B', refStoryC: 'B invites C', refStoryEarn: 'You earn', refExample: 'Ex: If user finishes 100 task' },
};

export const MOCK_PLATFORMS: Platform[] = [
  {
    id: '1',
    name: 'RoyalWin Indonesia',
    logoUrl: 'https://picsum.photos/100/100?random=1',
    description: 'Best slots and live casino in Indonesia. High Win Rate!',
    downloadLink: 'https://example.com/download/royalwin',
    firstDepositAmount: 50000,
    rewardAmount: 15000,
    launchDate: '2023-10-01',
    isHot: true,
    remainingQty: 45,
    totalQty: 100,
    steps: ['Click "Start Task" to download APK', 'Register with phone number', 'Deposit 50k IDR', 'Upload screenshot of deposit'],
    rules: 'New users only. Deposit must be made within 24 hours of registration.',
    status: 'online',
    type: 'deposit',
    targetCountries: ['id']
  },
  {
    id: '2',
    name: 'ThaiLucky Lotto',
    logoUrl: 'https://picsum.photos/100/100?random=2',
    description: 'Thai number 1 lottery app.',
    downloadLink: 'https://example.com/download/thailucky',
    firstDepositAmount: 200, 
    rewardAmount: 50,
    launchDate: '2023-11-15',
    remainingQty: 12,
    totalQty: 50,
    steps: ['Download App', 'Register', 'Deposit 200 THB'],
    rules: 'Screenshot must show the transaction ID.',
    status: 'online',
    type: 'deposit',
    targetCountries: ['th']
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    title: 'Indo Special Bonus',
    imageUrl: 'https://picsum.photos/800/400?random=10',
    content: 'Deposit 50k to get 20k extra bonus!',
    link: '/task/1',
    active: true,
    targetCountries: ['id']
  }
];