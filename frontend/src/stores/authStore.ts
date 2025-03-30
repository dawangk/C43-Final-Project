import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userInfo: any | null;
  setCredentials: (payload: any) => void;
  clearCredentials: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userInfo: null,// Initial state
      setCredentials: (payload) => set(() => ({
        userInfo: payload
      })),
      clearCredentials: () => set(() => ({
        userInfo: null
      })),
    }),
    {
      name: 'auth-storage', 
      storage: {
        getItem: (name) => {
          const userInfoStr = localStorage.getItem('userInfo');
          return {
            state: {
              userInfo: userInfoStr ? JSON.parse(userInfoStr) : null
            },
            version: 0
          };
        },
        
        setItem: (name, value) => {
          if (value.state.userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(value.state.userInfo));
            const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // = 30 days
            localStorage.setItem('expirationTime', expirationTime.toString());
          }
        },
        
        removeItem: (name) => {
          localStorage.clear();
        }
      }
    }
  )
);

export default useAuthStore;

export const getUserInfo = (): any | null => useAuthStore.getState().userInfo;