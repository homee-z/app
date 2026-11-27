import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import type { User } from "@/types/user.types";
import { AuthProvider } from "@/components/context/AuthProvider";
import { HouseholdProvider } from "@/components/context/HouseholdProvider";
import { Household } from "@/types/household-types";
import { getMyHouseholds } from "@/lib/households";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: User | null = null;
  let household : Household[] = [];

  try {
    [user, household] = await Promise.all([
      await getCurrentUser(),
      await getMyHouseholds()
    ])

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    throw error;
  }

  if (!user) {
    redirect("/login");
  }

  const defaultHousehold = household.find((household) =>(household.isDefault === true && household.status === 'active'));

  console.log(defaultHousehold);

  if (!defaultHousehold) {
    redirect("/foyer");
  }

  return (
    <AuthProvider user={user}>
      <HouseholdProvider household={defaultHousehold}>
        {children}
      </HouseholdProvider>
    </AuthProvider>
  );
  
}
