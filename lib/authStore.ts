import { create } from 'zustand';
import {
  fetchSession,
  isAuthUnauthorizedError,
  revokeSession,
  refreshSession,
  type TokenUser,
} from './authApi';
import { type UserProfile, fetchCurrentUser, updateUserProfile, uploadUserProfileImage } from './userApi';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  setTokens: (accessToken: string, tokenUser: TokenUser) => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  updateUser: (data: { displayName?: string; bio?: string; description?: string }) => Promise<void>;
  uploadProfileImage: (file: File, type: 'profile' | 'cover') => Promise<void>;
}

let restoreSessionPromise: Promise<void> | null = null;
let refreshAccessTokenPromise: Promise<string | null> | null = null;

function toUserProfile(user: TokenUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function applyAuthenticatedState(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  accessToken: string,
  user: TokenUser
) {
  set((state) => ({
    accessToken,
    userId: user.id,
    isAuthenticated: true,
    user: state.user
      ? { ...state.user, ...toUserProfile(user) }
      : toUserProfile(user),
  }));
}

function clearAuthenticatedState(
  set: (partial: Partial<AuthState>) => void
) {
  set({
    accessToken: null,
    userId: null,
    isAuthenticated: false,
    user: null,
  });
}

async function hydrateCurrentUser(userId: string, set: (partial: Partial<AuthState>) => void) {
  try {
    const user = await fetchCurrentUser(userId);
    set({ user });
  } catch {
    // Minimal session user data remains usable if profile hydration fails.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  user: null,

  async setTokens(accessToken, tokenUser) {
    applyAuthenticatedState(set, accessToken, tokenUser);
    void hydrateCurrentUser(tokenUser.id, set);
  },

  async restoreSession() {
    if (!restoreSessionPromise) {
      restoreSessionPromise = (async () => {
        set({ isLoading: true });

        try {
          const session = await fetchSession();
          applyAuthenticatedState(set, session.accessToken, session.user);
          void hydrateCurrentUser(session.user.id, set);
        } catch (error) {
          if (!isAuthUnauthorizedError(error)) {
            // Non-auth bootstrap failures should still leave the app signed out.
          }
          clearAuthenticatedState(set);
        } finally {
          set({ isLoading: false });
          restoreSessionPromise = null;
        }
      })();
    }

    await restoreSessionPromise;
  },

  async refreshAccessToken() {
    if (!refreshAccessTokenPromise) {
      refreshAccessTokenPromise = (async () => {
        try {
          const session = await refreshSession();
          applyAuthenticatedState(set, session.accessToken, session.user);
          return session.accessToken;
        } catch (error) {
          if (isAuthUnauthorizedError(error)) {
            clearAuthenticatedState(set);
            return null;
          }

          throw error;
        } finally {
          refreshAccessTokenPromise = null;
        }
      })();
    }

    return refreshAccessTokenPromise;
  },

  async updateUser(data) {
    await updateUserProfile(data);
    set(state => ({
      user: state.user ? { ...state.user, ...data } : state.user,
    }));
  },

  async uploadProfileImage(file, type) {
    const { objectKey } = await uploadUserProfileImage(file, type);
    set(state => {
      if (!state.user) return {};
      return {
        user: {
          ...state.user,
          ...(type === 'profile' ? { avatarUrl: objectKey } : { coverPhotoUrl: objectKey }),
        },
      };
    });
  },

  async logout() {
    clearAuthenticatedState(set);

    try {
      await revokeSession();
    } catch {
      // Local auth state is already cleared.
    }
  },
}));
