import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { LoginRequest, SignupRequest, AuthResponse, RefreshTokenRequest, UpdateUserRequest } from '../types/auth';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import crypto from 'crypto';
import { sendResetEmail } from '../utils/email';

const router = Router();
const userService = new UserService();

// 회원가입
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name }: SignupRequest = req.body;

    // 이메일 중복 체크
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 새 사용자 생성
    const newUser = await userService.createUser(email, password, name);

    // 토큰 생성
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 로그인
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // 사용자 찾기
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// 비밀번호 변경 (로그인 필요)
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호가 필요합니다.' });
  }

  // 현재 로그인된 사용자 정보 조회
  const user = await userService.findById(req.user?.id || '');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 현재 비밀번호 검증
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
  }

  // 새 비밀번호 해시 후 저장
  const hashed = await bcrypt.hash(newPassword, 10);
  await userService.updatePasswordAndClearToken(user.id, hashed);

  res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
});

// 토큰 갱신
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;

    // 리프레시 토큰 검증 및 새 액세스 토큰 발급
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userService.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// 현재 사용자 정보 조회
router.get('/my-profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.findById(req.user?.id || '');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

router.put('/my-profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password }: UpdateUserRequest = req.body;
    const user = await userService.findById(req.user?.id || '');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    user.email = email;
    user.password = password;

    await userService.updateUser(user);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user information' });
  }
});

// 비밀번호 재설정 요청 (이메일로 토큰 발송)
router.post('/request-reset', async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);
  if (!user) {
    // 보안상 존재하지 않는 이메일이어도 성공 응답
    return res.json({ message: '입력하신 이메일로 비밀번호 재설정 링크가 전송되었습니다.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1시간 유효

  await userService.setResetToken(email, token, expiry);

  // 이메일로 링크 전송 
  const resetLink = `https://c2ccom.netlify.app/reset-password?token=${token}`;
  await sendResetEmail(email, resetLink);

  res.json({ message: '입력하신 이메일로 비밀번호 재설정 링크가 전송되었습니다.' });
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: '토큰과 새 비밀번호가 필요합니다.' });
  }

  // 토큰과 만료시간 검증
  const user = await userService.findByResetToken(token);
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return res.status(400).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
  }

  // 비밀번호 해시 후 저장
  const hashed = await bcrypt.hash(newPassword, 10);
  await userService.updatePasswordAndClearToken(user.id, hashed);

  res.json({ message: '비밀번호가 재설정되었습니다.' });
});

export default router; 