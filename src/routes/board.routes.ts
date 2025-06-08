import { Router, Request, Response } from 'express';
import { BoardService } from '../services/board.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const boardService = new BoardService();

// 게시판 관련 라우트
router.get('/boards', async (req: Request, res: Response) => {
  try {
    const boards = await boardService.getAllBoards();
    console.log(boards);
    res.json(boards);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '게시판 목록을 가져오는데 실패했습니다.' });
  }
});

router.get('/boards/:id', async (req: Request, res: Response) => {
  try {
    const board = await boardService.getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: '게시판을 찾을 수 없습니다.' });
    }
    console.log(board);
    res.json(board);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '게시판 정보를 가져오는데 실패했습니다.' });
  }
});

router.post('/boards', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const board = await boardService.createBoard(req.body);
    console.log(board);
    res.status(201).json(board);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '게시판 생성에 실패했습니다.' });
  }
});

router.put('/boards/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const board = await boardService.updateBoard(req.params.id, req.body);
    if (!board) {
      return res.status(404).json({ message: '게시판을 찾을 수 없습니다.' });
    }
    console.log(board);
    res.json(board);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '게시판 수정에 실패했습니다.' });
  }
});

router.delete('/boards/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await boardService.deleteBoard(req.params.id);
    console.log(`${req.params.id}: 게시판 삭제`);
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '게시판 삭제에 실패했습니다.' });
  }
});

// 게시글 관련 라우트
router.get('/boards/:boardId/posts', async (req: Request, res: Response) => {
  try {
    const posts = await boardService.getPosts(req.params.boardId);
    console.log(posts[0]);
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '게시글 목록을 가져오는데 실패했습니다.' });
  }
});

router.get('/boards/:boardId/posts/:postId', async (req: Request, res: Response) => {
  try {
    const post = await boardService.getPostById(req.params.boardId, req.params.postId);
    if (!post) {
      console.log(`${req.params.boardId}, ${req.params.postId}: 게시글을 찾을 수 없습니다.`);
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    console.log(post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '게시글 정보를 가져오는데 실패했습니다.' });
  }
});

router.post('/boards/:boardId/posts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const post = await boardService.createPost(req.params.boardId, {
      ...req.body,
      authorId: req.user.id
    });
    console.log(post);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: '게시글 작성에 실패했습니다.' });
  }
});

router.put('/boards/:boardId/posts/:postId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const post = await boardService.updatePost(
      req.params.boardId,
      req.params.postId,
      req.body,
      req.user.id
    );
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    console.log(post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '게시글 수정에 실패했습니다.' });
  }
});

router.delete('/boards/:boardId/posts/:postId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    await boardService.deletePost(req.params.boardId, req.params.postId, req.user.id);
    console.log(`${req.params.boardId}, ${req.params.postId}, ${req.user?.id}: 게시글 삭제`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
  }
});

// 댓글 관련 라우트
router.get('/boards/:boardId/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const comments = await boardService.getComments(req.params.boardId, req.params.postId);
    console.log(comments[0]);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: '댓글 목록을 가져오는데 실패했습니다.' });
  }
});

router.post('/boards/:boardId/posts/:postId/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const comment = await boardService.createComment(req.params.boardId, req.params.postId, {
      ...req.body,
      authorId: req.user.id
    });
    console.log(comment);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: '댓글 작성에 실패했습니다.' });
  }
});

router.put('/boards/:boardId/posts/:postId/comments/:commentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const comment = await boardService.updateComment(
      req.params.boardId,
      req.params.postId,
      req.params.commentId,
      req.body,
      req.user.id
    );
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    console.log(comment);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: '댓글 수정에 실패했습니다.' });
  }
});

router.delete('/boards/:boardId/posts/:postId/comments/:commentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    await boardService.deleteComment(
      req.params.boardId,
      req.params.postId,
      req.params.commentId,
      req.user.id
    );
    console.log(`${req.params.boardId}, ${req.params.postId}, ${req.params.commentId}, ${req.user?.id}: 댓글 삭제`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: '댓글 삭제에 실패했습니다.' });
  }
});

// 댓글 좋아요/싫어요 관련 라우트
router.post('/boards/:boardId/posts/:postId/comments/:commentId/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const comment = await boardService.likeComment(
      req.params.boardId,
      req.params.postId,
      req.params.commentId,
      req.user.id
    );
    console.log(comment);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: '댓글 좋아요 처리에 실패했습니다.' });
  }
});

router.post('/boards/:boardId/posts/:postId/comments/:commentId/dislike', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const comment = await boardService.dislikeComment(
      req.params.boardId,
      req.params.postId,
      req.params.commentId,
      req.user.id
    );
    console.log(comment);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: '댓글 싫어요 처리에 실패했습니다.' });
  }
});

// 게시글 좋아요/싫어요 관련 라우트
router.post('/boards/:boardId/posts/:postId/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const post = await boardService.likePost(
      req.params.boardId,
      req.params.postId,
      req.user.id
    );
    console.log(post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '게시글 좋아요 처리에 실패했습니다.' });
  }
});

router.post('/boards/:boardId/posts/:postId/dislike', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      console.log(`${req.user?.id}: 인증되지 않은 사용자입니다.`);
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
    const post = await boardService.dislikePost(
      req.params.boardId,
      req.params.postId,
      req.user.id
    );
    console.log(post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '게시글 싫어요 처리에 실패했습니다.' });
  }
});

export default router; 