interface UserProfileProps {
  user: {
    username: string;
    email: string;
    karma: number;
    createdAt: Date;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
      <div className="text-gray-600 mb-2">{user.email}</div>
      <div className="mb-2">Karma: <span className="font-semibold">{user.karma}</span></div>
      <div className="text-sm text-gray-500">Joined: {user.createdAt.toLocaleDateString()}</div>
    </div>
  );
} 