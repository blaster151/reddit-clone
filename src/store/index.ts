import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Post, Comment, Subreddit } from '@/types';

// Types for the store
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  userLoading: boolean;
  userError: string | null;
}

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  postsLoading: boolean;
  postsError: string | null;
  hasMore: boolean;
  page: number;
}

interface CommentsState {
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  searchQuery: string;
  selectedSubreddit: string | null;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Main store interface
interface AppStore extends UserState, PostsState, CommentsState, UIState {
  // User actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUserLoading: (isLoading: boolean) => void;
  setUserError: (error: string | null) => void;
  logout: () => void;

  // Posts actions
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  setCurrentPost: (post: Post | null) => void;
  setPostsLoading: (isLoading: boolean) => void;
  setPostsError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  loadMorePosts: () => void;

  // Comments actions
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  removeComment: (commentId: string) => void;
  setCommentsLoading: (isLoading: boolean) => void;
  setCommentsError: (error: string | null) => void;

  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedSubreddit: (subredditId: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

// Create the store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      // User state
      user: null,
      isAuthenticated: false,
      userLoading: false,
      userError: null,

      // Posts state
      posts: [],
      currentPost: null,
      postsLoading: false,
      postsError: null,
      hasMore: true,
      page: 1,

      // Comments state
      comments: [],
      commentsLoading: false,
      commentsError: null,

      // UI state
      theme: 'light',
      sidebarOpen: false,
      searchQuery: '',
      selectedSubreddit: null,
      notifications: [],

      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setUserLoading: (userLoading) => set({ userLoading }),
      setUserError: (userError) => set({ userError }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        userError: null,
        posts: [],
        comments: [],
        currentPost: null,
        notifications: []
      }),

      // Posts actions
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ 
        posts: [post, ...state.posts] 
      })),
      updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId ? { ...post, ...updates } : post
        ),
        currentPost: state.currentPost?.id === postId 
          ? { ...state.currentPost, ...updates }
          : state.currentPost
      })),
      removePost: (postId) => set((state) => ({
        posts: state.posts.filter(post => post.id !== postId),
        currentPost: state.currentPost?.id === postId ? null : state.currentPost
      })),
      setCurrentPost: (post) => set({ currentPost: post }),
      setPostsLoading: (postsLoading) => set({ postsLoading }),
      setPostsError: (postsError) => set({ postsError }),
      setHasMore: (hasMore) => set({ hasMore }),
      setPage: (page) => set({ page }),
      loadMorePosts: () => set((state) => ({ page: state.page + 1 })),

      // Comments actions
      setComments: (comments) => set({ comments }),
      addComment: (comment) => set((state) => ({ 
        comments: [comment, ...state.comments] 
      })),
      updateComment: (commentId, updates) => set((state) => ({
        comments: state.comments.map(comment => 
          comment.id === commentId ? { ...comment, ...updates } : comment
        )
      })),
      removeComment: (commentId) => set((state) => ({
        comments: state.comments.filter(comment => comment.id !== commentId)
      })),
      setCommentsLoading: (commentsLoading) => set({ commentsLoading }),
      setCommentsError: (commentsError) => set({ commentsError }),

      // UI actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedSubreddit: (selectedSubreddit) => set({ selectedSubreddit }),
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            read: false
          },
          ...state.notifications
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'reddit-clone-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        selectedSubreddit: state.selectedSubreddit,
      }),
    }
  )
);

// Simple selector hooks for better performance
export const useUser = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.userLoading,
  error: state.userError,
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setUserLoading: state.setUserLoading,
  setUserError: state.setUserError,
  logout: state.logout,
}));

export const usePosts = () => useAppStore((state) => ({
  posts: state.posts,
  currentPost: state.currentPost,
  isLoading: state.postsLoading,
  error: state.postsError,
  hasMore: state.hasMore,
  page: state.page,
  setPosts: state.setPosts,
  addPost: state.addPost,
  updatePost: state.updatePost,
  removePost: state.removePost,
  setCurrentPost: state.setCurrentPost,
  setPostsLoading: state.setPostsLoading,
  setPostsError: state.setPostsError,
  setHasMore: state.setHasMore,
  setPage: state.setPage,
  loadMorePosts: state.loadMorePosts,
}));

export const useComments = () => useAppStore((state) => ({
  comments: state.comments,
  isLoading: state.commentsLoading,
  error: state.commentsError,
  setComments: state.setComments,
  addComment: state.addComment,
  updateComment: state.updateComment,
  removeComment: state.removeComment,
  setCommentsLoading: state.setCommentsLoading,
  setCommentsError: state.setCommentsError,
}));

export const useUI = () => useAppStore((state) => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  searchQuery: state.searchQuery,
  selectedSubreddit: state.selectedSubreddit,
  notifications: state.notifications,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSearchQuery: state.setSearchQuery,
  setSelectedSubreddit: state.setSelectedSubreddit,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  markNotificationAsRead: state.markNotificationAsRead,
  clearNotifications: state.clearNotifications,
})); 