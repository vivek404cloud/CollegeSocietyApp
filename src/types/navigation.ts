import { NavigatorScreenParams } from '@react-navigation/native';
import { User } from '@firebase/auth';

export type HomeStackParamList = {
  HomeMain: undefined;
  HomeDetails: undefined;
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  ExploreDetails: {
    societyId: string;
  };
};

export type CreateStackParamList = {
  CreateMain:
    | {
        societyId?: string;
      }
    | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileDetails: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  CreateTab: NavigatorScreenParams<CreateStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<RootTabParamList>;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type UserRole = 'Student' | 'Admin';

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  college: string;
  branch: string;
  year: string;
  role: UserRole;
};

export type UserProfileForm = Omit<UserProfile, 'uid' | 'email'>;

export type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  configError: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: UserProfileForm) => Promise<void>;
  refreshProfile: () => Promise<void>;
};
