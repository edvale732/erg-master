import { headers } from 'next/headers';
import { auth } from '@/app/lib/auth';

export const getAuthenticatedUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
};
