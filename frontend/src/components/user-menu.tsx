import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import {
  logout,
} from "@/api/authApiSlice";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/stores/authStore";

export function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  })
  const clearCredentials = useAuthStore(state => state.clearCredentials);

  const data = JSON.parse(localStorage.getItem("userInfo") ?? "{}"); //User Data
  const username =
    data ? (data?.username as string) : "John Doe";
  const email =
    data ? (data?.email as string) : "someone@gmail.com";

  const handleLogout = async () => {
    try {
      logoutMutation.mutate();
      clearCredentials();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex flex-row items-center gap-4 px-4 text-sm">
          {username}
          <Avatar>
            {/* Avatar Image is the profile picture of the user. The default avatar is used as a placeholder for now. */}
            <AvatarImage src="/img/grey-avatar.png" className="h-18 w-18" />
            {/* Avatar Fallback is the initials of the user. Avatar Fallback will be used if Avatar Image fails to load */}
            <AvatarFallback>{username.split(" ").map((word) => word[0].toLocaleUpperCase()).join("")}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="p-4 flex gap-4 items-center">
          <Mail size={16} />
          <p className="text-sm font-medium">
            {email}
          </p>
        </div>
        <DropdownMenuItem>
          <button className="w-full text-left" onClick={handleLogout}>
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
