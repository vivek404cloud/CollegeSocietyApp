import { Timestamp } from 'firebase/firestore';

export type FirestoreDateValue = Timestamp | null;

export type SocietyStatus = 'draft' | 'active' | 'archived';

export type MemberStatus = 'invited' | 'active' | 'inactive' | 'alumni';

export type PermissionKey =
  | 'society.manage'
  | 'members.manage'
  | 'roles.manage'
  | 'events.manage'
  | 'posts.manage';

export type SocialPlatform = 'instagram' | 'linkedin' | 'website' | 'youtube' | 'x' | 'discord';

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  isFeatured: boolean;
  createdAt: FirestoreDateValue;
  updatedAt: FirestoreDateValue;
};

export type Society = {
  id: string;
  name: string;
  nameLowercase: string;
  slug: string;
  shortName: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  logoUrl: string | null;
  logoPath: string | null;
  bannerUrl: string | null;
  socialLinks: SocialLink[];
  status: SocietyStatus;
  foundedYear: number | null;
  contactEmail: string | null;
  memberCount: number;
  followerCount: number;
  trendingScore: number;
  createdBy: string;
  createdAt: FirestoreDateValue;
  updatedAt: FirestoreDateValue;
};

export type SocietyRole = {
  id: string;
  societyId: string;
  name: string;
  slug: string;
  description: string;
  permissions: PermissionKey[];
  priority: number;
  isSystemRole: boolean;
  createdAt: FirestoreDateValue;
  updatedAt: FirestoreDateValue;
};

export type SocietyMember = {
  id: string;
  societyId: string;
  userId: string;
  roleIds: string[];
  userName: string;
  userEmail: string;
  joinedAt: FirestoreDateValue;
  invitedBy: string | null;
  status: MemberStatus;
  createdAt: FirestoreDateValue;
  updatedAt: FirestoreDateValue;
};

export type SocietyEvent = {
  id: string;
  societyId: string;
  title: string;
  description: string;
  venue: string;
  startAt: FirestoreDateValue;
  endAt: FirestoreDateValue;
  createdAt: FirestoreDateValue;
  updatedAt: FirestoreDateValue;
};

export type SocietyFollow = {
  id: string;
  societyId: string;
  userId: string;
  createdAt: FirestoreDateValue;
};

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export type CreateSocietyInput = {
  name: string;
  description: string;
  categoryId: string;
  logoUrl: string | null;
  logoPath: string | null;
  bannerUrl: string | null;
  socialLinks: SocialLink[];
  status: SocietyStatus;
  foundedYear: number | null;
  contactEmail: string | null;
  shortName?: string;
  shortDescription?: string;
  createdBy: string;
};

export type CreateSocietyRoleInput = Omit<SocietyRole, 'id' | 'createdAt' | 'updatedAt'>;

export type CreateSocietyMemberInput = Omit<SocietyMember, 'id' | 'createdAt' | 'updatedAt'>;

export type CreateSocietyEventInput = Omit<SocietyEvent, 'id' | 'createdAt' | 'updatedAt'>;

export type CreateSocietyFormValues = {
  name: string;
  description: string;
  categoryId: string;
  logoUri: string | null;
  socialLinks: SocialLink[];
};
