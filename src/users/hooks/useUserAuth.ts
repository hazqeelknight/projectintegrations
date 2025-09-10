import { useAuthStore } from '@/store/authStore';
import { 
  useLogin, 
  useRegister, 
  useLogout, 
  useChangePassword, 
  useForcedPasswordChange 
} from '../api/auth';
import { LoginCredentials, RegisterData, ChangePasswordData, ForcedPasswordChangeData } from '../types';

export const useUserAuth = () => {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout, updateUser } = useAuthStore();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();
  const forcedPasswordChangeMutation = useForcedPasswordChange();

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);
      storeLogin(result.user, result.token);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await registerMutation.mutateAsync(data);
      storeLogin(result.user, result.token);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      storeLogout();
    } catch (error) {
      // Even if API fails, clear local state
      storeLogout();
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const result = await changePasswordMutation.mutateAsync(data);
      if (result.token) {
        useAuthStore.getState().setToken(result.token);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const forcedPasswordChange = async (data: ForcedPasswordChangeData) => {
    try {
      const result = await forcedPasswordChangeMutation.mutateAsync(data);
      if (result.token) {
        useAuthStore.getState().setToken(result.token);
      }
      // Update user account status to active
      if (user) {
        updateUser({ account_status: 'active' });
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    changePassword,
    forcedPasswordChange,
    
    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isForcedPasswordChange: forcedPasswordChangeMutation.isPending,
  };
};