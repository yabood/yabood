import React, { useEffect, useState } from 'react';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <span className="text-gray-500">Loading...</span>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <a href="/profile" className="text-gray-700 hover:text-gray-900">
          {user.name || user.email}
        </a>
        <a
          href="/api/auth/signout"
          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">
          Sign Out
        </a>
      </div>
    );
  }

  return (
    <a
      href="/auth/signin"
      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
      Sign In
    </a>
  );
}
