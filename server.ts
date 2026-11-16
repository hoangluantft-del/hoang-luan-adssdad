import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // In-memory data stores for persistence during applet runtime
  const users: Record<string, any> = {};
  const premiumRequests: any[] = [];

  // Seed exams
  let seedExams: any[] = [];
  try {
    const examFilePath = path.join(__dirname, 'public', 'lib', 'seed-exams.json');
    if (fs.existsSync(examFilePath)) {
      seedExams = JSON.parse(fs.readFileSync(examFilePath, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading seed exams:', err);
  }

  // --- API ROUTES ---

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      ok: true,
      name: 'Hoàng Luân',
      author: 'Nguyễn Hoàng Luân',
      brand: 'Học Cùng Luân K9',
      status: 'Hệ thống đang hoạt động',
      time: new Date().toISOString(),
    });
  });

  // Exams endpoint
  app.all('/api/exams', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const action = req.query.action || req.body?.action || 'list';

    if (action === 'list') {
      const publicExams = seedExams.map((e) => ({
        id: e.id,
        title: e.title,
        subject: e.subject,
        grade: e.grade,
        program: e.program,
        year: e.year,
        examType: e.examType,
        examPeriod: e.examPeriod,
        periodLabel: e.periodLabel,
        source: e.source,
        sourceFile: e.sourceFile,
        duration: e.duration,
        questionsCount: e.questions?.length || 0,
      }));
      return res.json({ ok: true, exams: publicExams });
    }

    if (action === 'get') {
      const id = req.query.id || req.body?.id;
      const exam = seedExams.find((e) => e.id === id);
      if (!exam) {
        return res.status(404).json({ ok: false, message: 'Không tìm thấy đề thi' });
      }
      return res.json({ ok: true, exam });
    }

    if (action === 'submit') {
      const id = req.body?.id || req.query.id;
      const userAnswers = req.body?.answers || {};
      const exam = seedExams.find((e) => e.id === id);
      if (!exam) {
        return res.status(404).json({ ok: false, message: 'Đề thi không tồn tại' });
      }

      // Simple scoring calculation
      let score = 0;
      let total = 0;
      const questions = exam.questions || [];

      for (const q of questions) {
        total += 1;
        const ans = userAnswers[q.id];
        if (q.type === 'mcq') {
          const correctOptIdx = q.correct ?? (Array.isArray(q.options) ? q.options.indexOf(q.answer) : -1);
          const correctLetter = correctOptIdx >= 0 ? String.fromCharCode(65 + correctOptIdx) : String(q.answer);
          if (String(ans).toUpperCase() === String(correctLetter).toUpperCase()) {
            score += 1;
          }
        } else if (q.type === 'short') {
          const val = String(ans || '').trim().toLowerCase();
          const expected = String(q.answer || '').trim().toLowerCase();
          if (val && (val === expected || q.acceptedAnswers?.map((x: any) => String(x).toLowerCase()).includes(val))) {
            score += 1;
          }
        } else {
          score += 0.5; // partial for true/false participation
        }
      }

      const final10 = total > 0 ? Number(((score / total) * 10).toFixed(2)) : 0;
      return res.json({
        ok: true,
        score: final10,
        rawScore: score,
        maxScore: total,
        totalQuestions: total,
        message: 'Hoàn thành bài thi!',
      });
    }

    res.json({ ok: true, exams: seedExams });
  });

  // Premium endpoint
  app.all('/api/premium', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const action = req.query.action || req.body?.action || 'status';

    if (action === 'status') {
      return res.json({
        ok: true,
        premium: false,
        pending: premiumRequests.length > 0,
        authenticated: false,
        data: { premium: false, pending: premiumRequests.length > 0 },
      });
    }

    if (action === 'request') {
      const payload = req.body || {};
      premiumRequests.push({
        id: 'REQ_' + Date.now(),
        student_name: payload.student_name || 'Học viên',
        payment_content: payload.payment_content || 'Premium',
        amount: payload.payment_amount || 20000,
        status: 'Chờ xét duyệt',
        created_at: new Date().toLocaleString('vi-VN'),
      });
      return res.json({
        ok: true,
        data: { ok: true, message: 'Đã gửi yêu cầu xét duyệt' },
      });
    }

    if (action === 'admin-list') {
      return res.json({
        ok: true,
        data: { ok: true, requests: premiumRequests },
      });
    }

    if (action === 'admin-set' || action === 'admin-gift') {
      return res.json({
        ok: true,
        data: { ok: true, message: 'Đã kích hoạt thành công' },
      });
    }

    res.json({ ok: true });
  });

  // Auth & Profile endpoint
  // Clean session handling: new visitors and friends start fresh with streak = 0
  app.all('/api/auth', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const action = req.query.action || req.body?.action || 'session';

    const cookieUser = req.headers.cookie?.match(/hoang_luan_user=([^;]+)/)?.[1];
    const loggedInUsername = cookieUser ? decodeURIComponent(cookieUser) : null;

    if (action === 'session' || action === 'me') {
      if (loggedInUsername && users[loggedInUsername]) {
        return res.json({
          ok: true,
          authenticated: true,
          user: users[loggedInUsername],
          csrf: 'csrf_hl_2026',
        });
      }
      // Return clean unauthenticated state so friends and guests can learn independently
      return res.json({
        ok: true,
        authenticated: false,
        user: null,
        csrf: 'csrf_hl_2026',
      });
    }

    if (action === 'login' || action === 'register') {
      const username = String(req.body?.username || '').trim().toLowerCase() || 'hoc_vien';
      const displayName = req.body?.display_name || req.body?.username || 'Học viên';
      // New user streak begins at 0 days until they study!
      users[username] = {
        username,
        display_name: displayName,
        avatar_url: '/assets/hoang-luan-avatar.jpg',
        streak: 0,
        preferred_grade: req.body?.preferred_grade || '2K9',
      };
      res.setHeader('Set-Cookie', `hoang_luan_user=${encodeURIComponent(username)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
      return res.json({
        ok: true,
        user: users[username],
        csrf: 'csrf_hl_2026',
      });
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', `hoang_luan_user=; Path=/; HttpOnly; Max-Age=0`);
      return res.json({ ok: true, message: 'Đã đăng xuất' });
    }

    if (action === 'save-profile') {
      const displayName = req.body?.display_name || 'Học viên';
      const avatarData = req.body?.avatar_data;
      const targetUser = loggedInUsername || 'hoc_vien';
      users[targetUser] = {
        username: targetUser,
        display_name: displayName,
        avatar_url: avatarData || '/assets/hoang-luan-avatar.jpg',
        streak: users[targetUser]?.streak || 0,
        preferred_grade: req.body?.preferred_grade || '2K9',
      };
      return res.json({
        ok: true,
        data: { ok: true, user: users[targetUser], csrf: 'csrf_hl_2026' },
      });
    }

    res.json({ ok: true });
  });

  // Reference documents endpoint
  app.get('/api/reference-docs', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      ok: true,
      docs: [
        {
          id: 'doc-dien-bien-sinh-2026',
          title: 'Đề Sinh học THPT Sở Điện Biên 2026 - Mã 0401',
          subject: 'Sinh học 12',
          grade: '12',
          url: '/exam-sources/dien-bien-sinh-2026-ma-0401.pdf',
        },
        {
          id: 'doc-lam-dong-toan-2026',
          title: 'Đề Toán khảo sát chất lượng THPT Sở Lâm Đồng 2026 - Lần 1',
          subject: 'Toán học 12',
          grade: '12',
          url: '/exam-sources/lam-dong-toan-2026-lan-1.pdf',
        },
      ],
    });
  });

  // Consultation registration endpoint
  const consultations: any[] = [];
  app.post('/api/consultation', (req: Request, res: Response) => {
    const { name, phone, targetExam, school, note } = req.body || {};
    consultations.push({ name, phone, targetExam, school, note, date: new Date().toISOString() });
    res.json({ ok: true, message: 'Đăng ký tư vấn thành công! Thầy Hoàng Luân sẽ gọi lại cho bạn trong 15 phút.' });
  });

  // Community endpoint
  app.all('/api/community', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, posts: [] });
  });

  // Legacy deep study library route
  app.get(['/kho-bai-giang', '/legacy'], (_req: Request, res: Response) => {
    const legacyPath = path.resolve(__dirname, 'index.legacy.html');
    if (fs.existsSync(legacyPath)) {
      return res.sendFile(legacyPath);
    }
    res.sendFile(path.resolve(__dirname, 'index.html'));
  });

  // Private password-protected Notepad source exporter (no public exposure)
  const EXPORT_PIN = process.env.SOURCE_EXPORT_PIN || 'luank9@2026';

  app.get('/tai-code', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Tải File Mã Nguồn Mở Bằng Notepad - Học Cùng Hoàng Luân</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
  <div class="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
    <div class="space-y-1 text-center">
      <span class="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">Khu vực riêng tư</span>
      <h1 class="text-xl font-extrabold text-[#0f2a5c]">Tải File Code Mở Bằng Notepad</h1>
      <p class="text-xs text-slate-500">Nhập mật khẩu riêng để tải file về máy tính (chuẩn UTF-8 không lỗi font tiếng Việt).</p>
    </div>

    <form id="export-form" class="space-y-4">
      <div>
        <label for="pin" class="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu bảo vệ</label>
        <input id="pin" name="pin" type="password" required placeholder="Nhập mật khẩu..." class="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-blue-500/20"/>
      </div>

      <div>
        <label for="mode" class="block text-xs font-bold text-slate-700 mb-1.5">Chọn định dạng tải về</label>
        <select id="mode" name="mode" class="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0f2a5c]">
          <option value="zip">Trọn bộ File Source (.zip) - Đầy đủ code, ảnh, đề PDF & backend (~13 MB)</option>
          <option value="html">File Trang Web (.html) - Bấm đúp mở thành web ngay (cũng mở được bằng Notepad)</option>
          <option value="txt">Tất cả code gộp (.txt) - Chỉ để đọc code trong Notepad</option>
        </select>
      </div>

      <button type="submit" id="submit-btn" class="w-full h-11 rounded-xl bg-[#0f2a5c] hover:bg-[#1e69f3] text-white font-bold text-sm transition-colors">
        Tải File Về Máy
      </button>
      <p id="status-msg" class="text-xs text-center font-semibold hidden"></p>
    </form>

    <div class="pt-3 border-t border-slate-100 text-center">
      <a href="/" class="text-xs font-semibold text-slate-500 hover:text-[#0f2a5c]">← Quay lại trang chủ</a>
    </div>
  </div>

  <script>
    document.getElementById('export-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const pin = document.getElementById('pin').value.trim();
      const mode = document.getElementById('mode').value;
      const btn = document.getElementById('submit-btn');
      const msg = document.getElementById('status-msg');

      btn.disabled = true;
      btn.textContent = mode === 'zip' ? 'Đang tải trọn bộ source...' : 'Đang chuẩn bị file...';
      msg.className = 'text-xs text-center font-semibold hidden';

      try {
        const res = await fetch('/api/private-source-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin, mode })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          msg.className = 'text-xs text-center font-semibold text-red-600 block';
          msg.textContent = err.message || 'Sai mật khẩu, vui lòng thử lại!';
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mode === 'zip'
          ? 'hoc-cung-hoang-luan-source.zip'
          : (mode === 'html' ? 'hoc-cung-hoang-luan.html' : 'code-web-hoc-cung-hoang-luan.txt');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        msg.className = 'text-xs text-center font-semibold text-emerald-600 block';
        msg.textContent = mode === 'zip'
          ? 'Đã tải xong trọn bộ source .zip! Giải nén ra để xem toàn bộ file & chạy web.'
          : (mode === 'html'
            ? 'Đã tải xong hoc-cung-hoang-luan.html! Bấm đúp để mở thành web hoặc Open with Notepad để xem code.'
            : 'Đã tải file .txt thành công! Bạn mở file vừa tải bằng Notepad nhé.');
      } catch (err) {
        msg.className = 'text-xs text-center font-semibold text-red-600 block';
        msg.textContent = 'Lỗi kết nối, vui lòng thử lại.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Tải File Về Máy';
      }
    });
  </script>
</body>
</html>`);
  });

  app.post('/api/private-source-export', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');

    const pin = String(req.body?.pin || '').trim();
    const mode = req.body?.mode === 'zip' ? 'zip' : (req.body?.mode === 'html' ? 'html' : 'txt');

    if (pin !== EXPORT_PIN) {
      return res.status(403).json({ ok: false, message: 'Mật khẩu không đúng!' });
    }

    if (mode === 'zip') {
      const zipFile = path.resolve(__dirname, '.private', 'hoc-cung-hoang-luan-source.zip');
      if (!fs.existsSync(zipFile)) {
        return res.status(404).json({ ok: false, message: 'Chưa tìm thấy file nén source.' });
      }
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="hoc-cung-hoang-luan-source.zip"');
      return res.sendFile(zipFile);
    }

    const readSafe = (relPath: string) => {
      const full = path.resolve(__dirname, relPath);
      return fs.existsSync(full) ? fs.readFileSync(full, 'utf-8') : '';
    };

    const indexHtml = readSafe('index.html') || readSafe('dist/index.html');

    if (mode === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="hoc-cung-hoang-luan.html"');
      return res.send(indexHtml);
    }

    const packageJson = readSafe('package.json');
    const viteConfig = readSafe('vite.config.ts');
    const tsconfigJson = readSafe('tsconfig.json');
    const serverTs = readSafe('server.ts');

    const bundleText = [
      '====================================================================',
      'MÃ NGUỒN TRANG WEB: HỌC CÙNG HOÀNG LUÂN (LUYỆN THI ĐGNL)',
      'Hướng dẫn: Mở trực tiếp bằng Notepad (UTF-8) trên Windows/Mac',
      '====================================================================',
      '',
      '--- [1/5] FILE: package.json ---',
      packageJson,
      '',
      '--- [2/5] FILE: vite.config.ts ---',
      viteConfig,
      '',
      '--- [3/5] FILE: tsconfig.json ---',
      tsconfigJson,
      '',
      '--- [4/5] FILE: server.ts (Backend Node.js + Express + API) ---',
      serverTs,
      '',
      '--- [5/5] FILE: index.html (Frontend Giao diện + Phòng thi CBT) ---',
      indexHtml,
      '',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="code-web-hoc-cung-hoang-luan.txt"');
    return res.send('\uFEFF' + bundleText);
  });

  // Block direct HTTP access to .private directory (even in Vite dev mode)
  app.use('/.private', (_req: Request, res: Response) => {
    res.status(404).send('Not found');
  });

  // Serve static assets directory
  app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
  app.use('/exam-sources', express.static(path.join(__dirname, 'public', 'exam-sources')));
  app.use(express.static(path.join(__dirname, 'public')));

  if (!isProd) {
    // Development mode: attach Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production mode
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Học Cùng Luân K9] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
