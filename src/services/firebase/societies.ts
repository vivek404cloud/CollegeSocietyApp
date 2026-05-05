import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { firebaseConfigError, firebaseDb, firebaseStorage } from '@/services/firebase/config';
import { UserProfile } from '@/types/navigation';
import {
  Category,
  CreateSocietyInput,
  Society,
  SocietyEvent,
  SocietyMember,
  SocietyRole,
} from '@/types/society';

export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  categories: 'categories',
  societies: 'societies',
  members: 'members',
  roles: 'roles',
  events: 'events',
  followedSocieties: 'followedSocieties',
} as const;

const DEFAULT_PAGE_SIZE = 8;
const TRENDING_LIMIT = 5;
const DEFAULT_ROLE_ID = 'member';
const ADMIN_ROLE_ID = 'admin';
const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Coding clubs, robotics teams, makerspaces, and technical communities.',
    icon: 'hardware-chip-outline',
    isFeatured: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    name: 'Cultural',
    slug: 'cultural',
    description: 'Dance, music, theatre, literature, and language societies.',
    icon: 'color-palette-outline',
    isFeatured: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Athletics, fitness, and competitive sports communities.',
    icon: 'football-outline',
    isFeatured: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    name: 'Entrepreneurship',
    slug: 'entrepreneurship',
    description: 'Startup, innovation, consulting, and leadership communities.',
    icon: 'trending-up-outline',
    isFeatured: false,
    createdAt: null,
    updatedAt: null,
  },
  {
    name: 'Social Impact',
    slug: 'social-impact',
    description: 'NGO, volunteering, and community impact groups.',
    icon: 'heart-outline',
    isFeatured: false,
    createdAt: null,
    updatedAt: null,
  },
];

export type SocietyFilters = {
  searchTerm?: string;
  categoryId?: string | null;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
};

export type SocietyPage = {
  items: Society[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

export type SocietyMarketplaceData = {
  societies: Society[];
  trendingSocieties: Society[];
  categories: Category[];
};

export type SocietyDetailData = {
  society: Society;
  category: Category | null;
  members: SocietyMember[];
  events: SocietyEvent[];
  currentMembership: SocietyMember | null;
  isFollowing: boolean;
  canEdit: boolean;
};

function ensureDb() {
  if (!firebaseDb) {
    throw new Error(firebaseConfigError ?? 'Cloud Firestore is not configured.');
  }

  return firebaseDb;
}

function ensureStorage() {
  if (!firebaseStorage) {
    throw new Error(firebaseConfigError ?? 'Firebase Storage is not configured.');
  }

  return firebaseStorage;
}

function categoriesCollection() {
  return collection(ensureDb(), FIRESTORE_COLLECTIONS.categories);
}

function societiesCollection() {
  return collection(ensureDb(), FIRESTORE_COLLECTIONS.societies);
}

function societyDoc(societyId: string) {
  return doc(ensureDb(), FIRESTORE_COLLECTIONS.societies, societyId);
}

function societyRoleDoc(societyId: string, roleId: string) {
  return doc(
    ensureDb(),
    FIRESTORE_COLLECTIONS.societies,
    societyId,
    FIRESTORE_COLLECTIONS.roles,
    roleId,
  );
}

function societyMembersCollection(societyId: string) {
  return collection(
    ensureDb(),
    FIRESTORE_COLLECTIONS.societies,
    societyId,
    FIRESTORE_COLLECTIONS.members,
  );
}

function societyMemberDoc(societyId: string, userId: string) {
  return doc(
    ensureDb(),
    FIRESTORE_COLLECTIONS.societies,
    societyId,
    FIRESTORE_COLLECTIONS.members,
    userId,
  );
}

function societyEventsCollection(societyId: string) {
  return collection(
    ensureDb(),
    FIRESTORE_COLLECTIONS.societies,
    societyId,
    FIRESTORE_COLLECTIONS.events,
  );
}

function userFollowedSocietyDoc(userId: string, societyId: string) {
  return doc(
    ensureDb(),
    FIRESTORE_COLLECTIONS.users,
    userId,
    FIRESTORE_COLLECTIONS.followedSocieties,
    societyId,
  );
}

function toCategory(snapshot: QueryDocumentSnapshot<DocumentData>): Category {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Category, 'id'>),
  };
}

function toSociety(snapshot: QueryDocumentSnapshot<DocumentData>): Society {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Society, 'id'>),
  };
}

function toSocietyMember(snapshot: QueryDocumentSnapshot<DocumentData>): SocietyMember {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<SocietyMember, 'id'>),
  };
}

function toSocietyEvent(snapshot: QueryDocumentSnapshot<DocumentData>): SocietyEvent {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<SocietyEvent, 'id'>),
  };
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildShortName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  if (words.length === 1) {
    return words[0].slice(0, 20);
  }

  return words
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function buildShortDescription(description: string) {
  return description.trim().slice(0, 120);
}

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  return response.blob();
}

async function seedDefaultCategories() {
  const batch = writeBatch(ensureDb());

  DEFAULT_CATEGORIES.forEach((category) => {
    const categoryRef = doc(categoriesCollection());
    batch.set(categoryRef, {
      ...category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function listCategories() {
  try {
    const snapshot = await getDocs(query(categoriesCollection(), orderBy('name', 'asc')));

    if (snapshot.empty) {
      try {
        await seedDefaultCategories();
        const seededSnapshot = await getDocs(query(categoriesCollection(), orderBy('name', 'asc')));
        return seededSnapshot.docs.map(toCategory);
      } catch {
        return DEFAULT_CATEGORIES.map((category) => ({
          ...category,
          id: category.slug,
        }));
      }
    }

    return snapshot.docs.map(toCategory);
  } catch {
    return DEFAULT_CATEGORIES.map((category) => ({
      ...category,
      id: category.slug,
    }));
  }
}

export async function getSocietyById(societyId: string) {
  const snapshot = await getDoc(societyDoc(societyId));

  if (!snapshot.exists()) {
    throw new Error('Society not found.');
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Society, 'id'>),
  } satisfies Society;
}

export async function uploadSocietyLogo(userId: string, uri: string) {
  const storage = ensureStorage();
  const fileExtensionMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const fileExtension = fileExtensionMatch?.[1]?.toLowerCase() ?? 'jpg';
  const storagePath = `societies/${userId}/${Date.now()}.${fileExtension}`;
  const logoRef = ref(storage, storagePath);
  const blob = await uriToBlob(uri);

  await uploadBytes(logoRef, blob, {
    contentType: blob.type || `image/${fileExtension}`,
  });

  const downloadUrl = await getDownloadURL(logoRef);

  return {
    downloadUrl,
    storagePath,
  };
}

async function createDefaultRoles(societyId: string) {
  const batch = writeBatch(ensureDb());

  batch.set(societyRoleDoc(societyId, ADMIN_ROLE_ID), {
    societyId,
    name: 'Admin',
    slug: 'admin',
    description: 'Full access to manage the society.',
    permissions: [
      'society.manage',
      'members.manage',
      'roles.manage',
      'events.manage',
      'posts.manage',
    ],
    priority: 100,
    isSystemRole: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(societyRoleDoc(societyId, DEFAULT_ROLE_ID), {
    societyId,
    name: 'Member',
    slug: 'member',
    description: 'Default role for joined members.',
    permissions: [],
    priority: 1,
    isSystemRole: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function createSociety(
  input: CreateSocietyInput,
  creator: Pick<UserProfile, 'uid' | 'email' | 'name'>,
) {
  const societyRef = doc(societiesCollection());
  const slug = toSlug(input.name);

  await setDoc(societyRef, {
    name: input.name.trim(),
    nameLowercase: input.name.trim().toLowerCase(),
    slug,
    shortName: input.shortName || buildShortName(input.name),
    description: input.description.trim(),
    shortDescription: input.shortDescription || buildShortDescription(input.description),
    categoryId: input.categoryId,
    logoUrl: input.logoUrl,
    logoPath: input.logoPath,
    bannerUrl: input.bannerUrl,
    socialLinks: input.socialLinks,
    status: input.status,
    foundedYear: input.foundedYear,
    contactEmail: input.contactEmail || creator.email,
    memberCount: 1,
    followerCount: 0,
    trendingScore: 1,
    createdBy: creator.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createDefaultRoles(societyRef.id);

  await setDoc(societyMemberDoc(societyRef.id, creator.uid), {
    societyId: societyRef.id,
    userId: creator.uid,
    roleIds: [ADMIN_ROLE_ID],
    userName: creator.name || creator.email,
    userEmail: creator.email,
    joinedAt: serverTimestamp(),
    invitedBy: creator.uid,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return societyRef.id;
}

export async function updateSociety(societyId: string, input: Partial<CreateSocietyInput>) {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.name) {
    payload.name = input.name.trim();
    payload.nameLowercase = input.name.trim().toLowerCase();
    payload.slug = toSlug(input.name);
    payload.shortName = input.shortName || buildShortName(input.name);
  }

  if (input.description) {
    payload.description = input.description.trim();
    payload.shortDescription = input.shortDescription || buildShortDescription(input.description);
  }

  if (input.categoryId) {
    payload.categoryId = input.categoryId;
  }

  if (input.logoUrl !== undefined) {
    payload.logoUrl = input.logoUrl;
  }

  if (input.logoPath !== undefined) {
    payload.logoPath = input.logoPath;
  }

  if (input.bannerUrl !== undefined) {
    payload.bannerUrl = input.bannerUrl;
  }

  if (input.socialLinks !== undefined) {
    payload.socialLinks = input.socialLinks;
  }

  if (input.status) {
    payload.status = input.status;
  }

  if (input.foundedYear !== undefined) {
    payload.foundedYear = input.foundedYear;
  }

  if (input.contactEmail !== undefined) {
    payload.contactEmail = input.contactEmail;
  }

  await updateDoc(societyDoc(societyId), payload);
}

export async function listSocietiesPage(filters: SocietyFilters = {}): Promise<SocietyPage> {
  const searchTerm = filters.searchTerm?.trim().toLowerCase();
  const categoryId = filters.categoryId?.trim();
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  let societiesQuery = searchTerm
    ? query(
        societiesCollection(),
        orderBy('nameLowercase', 'asc'),
        where('nameLowercase', '>=', searchTerm),
        where('nameLowercase', '<=', `${searchTerm}\uf8ff`),
        limit(pageSize),
      )
    : query(
        societiesCollection(),
        orderBy('trendingScore', 'desc'),
        orderBy('nameLowercase', 'asc'),
        limit(pageSize),
      );

  if (categoryId) {
    societiesQuery = searchTerm
      ? query(
          societiesCollection(),
          where('categoryId', '==', categoryId),
          orderBy('nameLowercase', 'asc'),
          where('nameLowercase', '>=', searchTerm),
          where('nameLowercase', '<=', `${searchTerm}\uf8ff`),
          limit(pageSize),
        )
      : query(
          societiesCollection(),
          where('categoryId', '==', categoryId),
          orderBy('trendingScore', 'desc'),
          orderBy('nameLowercase', 'asc'),
          limit(pageSize),
        );
  }

  if (filters.cursor) {
    societiesQuery = searchTerm
      ? categoryId
        ? query(
            societiesCollection(),
            where('categoryId', '==', categoryId),
            orderBy('nameLowercase', 'asc'),
            where('nameLowercase', '>=', searchTerm),
            where('nameLowercase', '<=', `${searchTerm}\uf8ff`),
            startAfter(filters.cursor),
            limit(pageSize),
          )
        : query(
            societiesCollection(),
            orderBy('nameLowercase', 'asc'),
            where('nameLowercase', '>=', searchTerm),
            where('nameLowercase', '<=', `${searchTerm}\uf8ff`),
            startAfter(filters.cursor),
            limit(pageSize),
          )
      : categoryId
        ? query(
            societiesCollection(),
            where('categoryId', '==', categoryId),
            orderBy('trendingScore', 'desc'),
            orderBy('nameLowercase', 'asc'),
            startAfter(filters.cursor),
            limit(pageSize),
          )
        : query(
            societiesCollection(),
            orderBy('trendingScore', 'desc'),
            orderBy('nameLowercase', 'asc'),
            startAfter(filters.cursor),
            limit(pageSize),
          );
  }

  const snapshot = await getDocs(societiesQuery);
  const items = snapshot.docs.map(toSociety);
  const cursor = snapshot.docs.at(-1) ?? null;

  return {
    items,
    cursor,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function getTrendingSocieties() {
  const snapshot = await getDocs(
    query(
      societiesCollection(),
      orderBy('trendingScore', 'desc'),
      orderBy('memberCount', 'desc'),
      limit(TRENDING_LIMIT),
    ),
  );

  return snapshot.docs.map(toSociety);
}

export async function getSocietyMarketplaceData(
  filters: SocietyFilters = {},
): Promise<SocietyMarketplaceData & Pick<SocietyPage, 'cursor' | 'hasMore'>> {
  const [categories, trendingSocieties, societiesPage] = await Promise.all([
    listCategories(),
    getTrendingSocieties(),
    listSocietiesPage(filters),
  ]);

  return {
    categories,
    trendingSocieties,
    societies: societiesPage.items,
    cursor: societiesPage.cursor,
    hasMore: societiesPage.hasMore,
  };
}

async function getCurrentMembership(societyId: string, userId?: string | null) {
  if (!userId) {
    return null;
  }

  const snapshot = await getDoc(societyMemberDoc(societyId, userId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<SocietyMember, 'id'>),
  } satisfies SocietyMember;
}

async function getIsFollowing(societyId: string, userId?: string | null) {
  if (!userId) {
    return false;
  }

  const snapshot = await getDoc(userFollowedSocietyDoc(userId, societyId));
  return snapshot.exists();
}

async function canUserEditSociety(society: Society, membership: SocietyMember | null) {
  if (!membership) {
    return false;
  }

  if (society.createdBy === membership.userId) {
    return true;
  }

  const roleSnapshots = await Promise.all(
    membership.roleIds.map((roleId) => getDoc(societyRoleDoc(society.id, roleId))),
  );

  return roleSnapshots.some((snapshot) => {
    if (!snapshot.exists()) {
      return false;
    }

    const role = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<SocietyRole, 'id'>),
    } satisfies SocietyRole;

    return role.permissions.includes('society.manage');
  });
}

export async function getSocietyDetailData(societyId: string, userId?: string | null) {
  const society = await getSocietyById(societyId);

  const [categorySnapshot, membersSnapshot, eventsSnapshot, membership, isFollowing] =
    await Promise.all([
      getDoc(doc(categoriesCollection(), society.categoryId)),
      getDocs(query(societyMembersCollection(societyId), orderBy('joinedAt', 'asc'), limit(20))),
      getDocs(query(societyEventsCollection(societyId), orderBy('startAt', 'asc'), limit(10))),
      getCurrentMembership(societyId, userId),
      getIsFollowing(societyId, userId),
    ]);

  const canEdit = await canUserEditSociety(society, membership);

  return {
    society,
    category: categorySnapshot.exists()
      ? ({
          id: categorySnapshot.id,
          ...(categorySnapshot.data() as Omit<Category, 'id'>),
        } satisfies Category)
      : null,
    members: membersSnapshot.docs.map(toSocietyMember),
    events: eventsSnapshot.docs.map(toSocietyEvent),
    currentMembership: membership,
    isFollowing,
    canEdit,
  } satisfies SocietyDetailData;
}

export async function joinSociety(
  societyId: string,
  profile: Pick<UserProfile, 'uid' | 'email' | 'name'>,
) {
  const db = ensureDb();

  await runTransaction(db, async (transaction) => {
    const membershipRef = societyMemberDoc(societyId, profile.uid);
    const membershipSnapshot = await transaction.get(membershipRef);

    if (membershipSnapshot.exists()) {
      return;
    }

    const societyRef = societyDoc(societyId);
    const societySnapshot = await transaction.get(societyRef);

    if (!societySnapshot.exists()) {
      throw new Error('Society not found.');
    }

    const society = societySnapshot.data() as Omit<Society, 'id'>;
    const nextMemberCount = (society.memberCount ?? 0) + 1;

    transaction.set(membershipRef, {
      societyId,
      userId: profile.uid,
      roleIds: [DEFAULT_ROLE_ID],
      userName: profile.name || profile.email,
      userEmail: profile.email,
      joinedAt: serverTimestamp(),
      invitedBy: null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(societyRef, {
      memberCount: nextMemberCount,
      trendingScore: Math.max(nextMemberCount, society.followerCount ?? 0),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function toggleFollowSociety(societyId: string, userId: string, isFollowing: boolean) {
  const db = ensureDb();

  await runTransaction(db, async (transaction) => {
    const followRef = userFollowedSocietyDoc(userId, societyId);
    const societyRef = societyDoc(societyId);
    const societySnapshot = await transaction.get(societyRef);

    if (!societySnapshot.exists()) {
      throw new Error('Society not found.');
    }

    const society = societySnapshot.data() as Omit<Society, 'id'>;
    const currentFollowers = society.followerCount ?? 0;
    const nextFollowerCount = isFollowing
      ? Math.max(0, currentFollowers - 1)
      : currentFollowers + 1;

    if (isFollowing) {
      transaction.delete(followRef);
    } else {
      transaction.set(followRef, {
        societyId,
        userId,
        createdAt: serverTimestamp(),
      });
    }

    transaction.update(societyRef, {
      followerCount: nextFollowerCount,
      trendingScore: Math.max(society.memberCount ?? 0, nextFollowerCount),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function createEvent(
  societyId: string,
  event: Omit<SocietyEvent, 'id' | 'societyId' | 'createdAt' | 'updatedAt'>,
) {
  await addDoc(societyEventsCollection(societyId), {
    ...event,
    societyId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function formatTimestamp(value: Timestamp | null) {
  if (!value) {
    return '';
  }

  return value.toDate().toLocaleDateString();
}

export const FIRESTORE_SCHEMA = {
  categories: {
    path: `/${FIRESTORE_COLLECTIONS.categories}/{categoryId}`,
    description: 'Top-level list of society categories such as technical, cultural, or sports.',
  },
  societies: {
    path: `/${FIRESTORE_COLLECTIONS.societies}/{societyId}`,
    description:
      'Primary society records with category, media, social links, and marketplace metadata.',
  },
  roles: {
    path: `/${FIRESTORE_COLLECTIONS.societies}/{societyId}/${FIRESTORE_COLLECTIONS.roles}/{roleId}`,
    description: 'Role definitions scoped to a single society.',
  },
  members: {
    path: `/${FIRESTORE_COLLECTIONS.societies}/{societyId}/${FIRESTORE_COLLECTIONS.members}/{userId}`,
    description: 'Membership record for one user inside one society.',
  },
  events: {
    path: `/${FIRESTORE_COLLECTIONS.societies}/{societyId}/${FIRESTORE_COLLECTIONS.events}/{eventId}`,
    description: 'Upcoming or past society events.',
  },
  followedSocieties: {
    path: `/${FIRESTORE_COLLECTIONS.users}/{userId}/${FIRESTORE_COLLECTIONS.followedSocieties}/{societyId}`,
    description: 'Per-user follow records for marketplace and detail interactions.',
  },
} as const;
