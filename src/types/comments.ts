export interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isPinned?: boolean;
  isFromNath?: boolean;
  isAngelOfTheDay?: boolean;
  replies?: Comment[];
}

export interface CommentSection {
  totalComments: number;
  comments: Comment[];
}
