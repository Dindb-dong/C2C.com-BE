import { Board, Post, Comment } from '@prisma/client';
import prisma from '../prisma';

export class BoardService {
  // 게시판 관련 서비스
  async getAllBoards(): Promise<Board[]> {
    return prisma.board.findMany();
  }

  async getBoardById(id: string): Promise<Board | null> {
    return prisma.board.findUnique({
      where: { id }
    });
  }

  async createBoard(data: { name: string; description?: string }): Promise<Board> {
    return prisma.board.create({
      data
    });
  }

  async updateBoard(id: string, data: { name?: string; description?: string }): Promise<Board> {
    return prisma.board.update({
      where: { id },
      data
    });
  }

  async deleteBoard(id: string): Promise<Board> {
    return prisma.board.delete({
      where: { id }
    });
  }

  // 게시글 관련 서비스
  async getPosts(boardId: string): Promise<Post[]> {
    return prisma.post.findMany({
      where: { boardId },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getPostById(boardId: string, postId: string): Promise<Post | null> {
    return prisma.post.findFirst({
      where: {
        id: postId,
        boardId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
  }

  async createPost(boardId: string, data: {
    title: string;
    content: string;
    authorId: string;
    category: string;
    tags?: string[];
  }): Promise<Post> {
    return prisma.post.create({
      data: {
        ...data,
        boardId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async updatePost(
    boardId: string,
    postId: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      tags?: string[];
    },
    authorId: string
  ): Promise<Post | null> {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        boardId,
        authorId
      }
    });

    if (!post) {
      return null;
    }

    return prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async deletePost(boardId: string, postId: string, authorId: string): Promise<Post> {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        boardId,
        authorId
      }
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    return prisma.post.delete({
      where: { id: postId }
    });
  }

  // 댓글 관련 서비스
  async getComments(boardId: string, postId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: {
        post: {
          id: postId,
          boardId
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async createComment(boardId: string, postId: string, data: { content: string; authorId: string }): Promise<Comment> {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        boardId
      }
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    return prisma.comment.create({
      data: {
        ...data,
        postId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async updateComment(
    boardId: string,
    postId: string,
    commentId: string,
    data: { content: string },
    authorId: string
  ): Promise<Comment | null> {
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        authorId,
        post: {
          boardId
        }
      }
    });

    if (!comment) {
      return null;
    }

    return prisma.comment.update({
      where: { id: commentId },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async deleteComment(boardId: string, postId: string, commentId: string, authorId: string): Promise<Comment> {
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        authorId,
        post: {
          boardId
        }
      }
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    return prisma.comment.delete({
      where: { id: commentId }
    });
  }

  // 댓글 좋아요/싫어요 관련 서비스
  async likeComment(boardId: string, postId: string, commentId: string, userId: string): Promise<Comment> {
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        post: {
          boardId
        }
      }
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    });

    if (existingLike) {
      throw new Error('이미 좋아요를 누른 댓글입니다.');
    }

    // 이미 싫어요를 눌렀다면 제거
    const existingDislike = await prisma.commentDislike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    });

    if (existingDislike) {
      await prisma.commentDislike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId
          }
        }
      });
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          dislikes: {
            decrement: 1
          }
        }
      });
    }

    // 좋아요 추가
    await prisma.commentLike.create({
      data: {
        commentId,
        userId
      }
    });

    return prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: {
          increment: 1
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async dislikeComment(boardId: string, postId: string, commentId: string, userId: string): Promise<Comment> {
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        post: {
          id: postId,
          boardId
        }
      }
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 이미 싫어요를 눌렀는지 확인
    const existingDislike = await prisma.commentDislike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    });

    if (existingDislike) {
      throw new Error('이미 싫어요를 누른 댓글입니다.');
    }

    // 이미 좋아요를 눌렀다면 제거
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId
          }
        }
      });
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          likes: {
            decrement: 1
          }
        }
      });
    }

    // 싫어요 추가
    await prisma.commentDislike.create({
      data: {
        commentId,
        userId
      }
    });

    return prisma.comment.update({
      where: { id: commentId },
      data: {
        dislikes: {
          increment: 1
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  // 게시글 좋아요/싫어요 관련 서비스
  async likePost(boardId: string, postId: string, userId: string): Promise<Post> {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        boardId
      }
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      throw new Error('이미 좋아요를 누른 게시글입니다.');
    }

    // 이미 싫어요를 눌렀다면 제거
    const existingDislike = await prisma.postDislike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingDislike) {
      await prisma.postDislike.delete({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });
      await prisma.post.update({
        where: { id: postId },
        data: {
          dislikes: {
            decrement: 1
          }
        }
      });
    }

    // 좋아요 추가
    await prisma.postLike.create({
      data: {
        postId,
        userId
      }
    });

    return prisma.post.update({
      where: { id: postId },
      data: {
        likes: {
          increment: 1
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async dislikePost(boardId: string, postId: string, userId: string): Promise<Post> {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        boardId
      }
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 이미 싫어요를 눌렀는지 확인
    const existingDislike = await prisma.postDislike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingDislike) {
      throw new Error('이미 싫어요를 누른 게시글입니다.');
    }

    // 이미 좋아요를 눌렀다면 제거
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });
      await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            decrement: 1
          }
        }
      });
    }

    // 싫어요 추가
    await prisma.postDislike.create({
      data: {
        postId,
        userId
      }
    });

    return prisma.post.update({
      where: { id: postId },
      data: {
        dislikes: {
          increment: 1
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
} 