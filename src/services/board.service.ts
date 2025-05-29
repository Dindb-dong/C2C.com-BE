import { PrismaClient, Board, Post, Comment } from '@prisma/client';

// Prisma 클라이언트를 싱글톤으로 초기화
const prisma = new PrismaClient();

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
        postId,
        post: {
          boardId
        }
      }
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

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
} 