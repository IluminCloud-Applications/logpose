import { useCallback } from "react";
import { useCachedQuery } from "./useCachedQuery";
import { invalidateCacheByPrefix } from "@/lib/queryCache";
import {
  fetchUsers,
  createInvite,
  updateUserRole,
  resetUserPassword,
  deleteUser,
  type User,
} from "@/services/users";

export function useUsers() {
  const { data, isLoading, error, reload } = useCachedQuery<User[]>({
    cachePrefix: "users",
    queryFn: fetchUsers,
  });

  const invalidateAndReload = useCallback(async () => {
    invalidateCacheByPrefix("users");
    await reload();
  }, [reload]);

  const invite = async (name: string, role: string) => {
    const result = await createInvite({ name, role });
    await invalidateAndReload();
    return result;
  };

  const changeRole = async (userId: number, role: string) => {
    await updateUserRole(userId, role);
    await invalidateAndReload();
  };

  const resetPassword = async (
    userId: number,
    newPassword: string,
    confirmPassword: string
  ) => {
    await resetUserPassword(userId, newPassword, confirmPassword);
  };

  const removeUser = async (userId: number) => {
    await deleteUser(userId);
    await invalidateAndReload();
  };

  return {
    users: data ?? [],
    loading: isLoading,
    error,
    reload: invalidateAndReload,
    invite,
    changeRole,
    resetPassword,
    removeUser,
  };
}
