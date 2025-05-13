import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { LoginRequest, SignupRequest, AuthResponse, RefreshTokenRequest, UpdateUserRequest } from '../types/auth';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService();

// 회원가입
router.post('/signup', async (req, res) => {
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
router.post('/login', async (req, res) => {
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

// 토큰 갱신
router.post('/refresh', async (req, res) => {
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
router.get('/my-profile', authenticateToken, async (req: AuthRequest, res) => {
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

router.put('/my-profile', authenticateToken, async (req: AuthRequest, res) => {
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

export default router; 