import { UserProfileForm } from '@/types/navigation';

export type ProfileValidationErrors = Partial<Record<keyof UserProfileForm, string>>;

export function validateProfile(values: UserProfileForm) {
  const errors: ProfileValidationErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (values.college.trim().length < 2) {
    errors.college = 'College is required.';
  }

  if (values.branch.trim().length < 2) {
    errors.branch = 'Branch is required.';
  }

  if (!/^\d{1,2}$/.test(values.year.trim())) {
    errors.year = 'Year must be a number like 1, 2, 3, or 4.';
  } else {
    const yearValue = Number(values.year);
    if (yearValue < 1 || yearValue > 8) {
      errors.year = 'Year must be between 1 and 8.';
    }
  }

  if (!['Student', 'Admin'].includes(values.role)) {
    errors.role = 'Role must be Student or Admin.';
  }

  return errors;
}
