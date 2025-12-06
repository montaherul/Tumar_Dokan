import React, { useState, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";
import { User, Shield, Ban, CheckCircle } from 'lucide-react'; // Icons

const API_BASE_URL = "http://localhost:5000/api";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null); // To show loading state for individual user actions

  useEffect(() => {
    if (!authLoading) {
      if (user && user.role === 'admin' && firebaseUser) {
        fetchUsers();
      } else {
        alert("Access Denied: You are not authorized to view user management.");
        navigate("/dashboard");
      }
    }
  }, [user, firebaseUser, authLoading, navigate]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setError("");
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Check console for details.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUpdateUserStatus = async (uid, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} this user?`)) {
      return;
    }
    setUpdatingUserId(uid);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/users/${uid}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(prevUsers => prevUsers.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
        alert(`User status updated to ${newStatus}.`);
      } else {
        throw new Error(data.message || "Failed to update user status.");
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      alert(`Failed to update user status: ${err.message}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateUserRole = async (uid, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    setUpdatingUserId(uid);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/users/${uid}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(prevUsers => prevUsers.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        alert(`User role updated to ${newRole}.`);
      } else {
        throw new Error(data.message || "Failed to update user role.");
      }
    } catch (err) {
      console.error("Error updating user role:", err);
      alert(`Failed to update user role: ${err.message}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (authLoading || usersLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-destructive font-bold">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background p-6 sm:p-10">
        <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">View and manage all registered users.</p>
          </div>
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
            {users.length} Users
          </div>
        </div>

        <div className="max-w-7xl mx-auto bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-background/20 transition-colors relative">
                    {updatingUserId === u.uid && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card bg-opacity-70 z-10">
                        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {u.photoURL ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={u.photoURL} alt={u.name} referrerPolicy="no-referrer" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{u.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">UID: {u.uid.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row justify-end gap-2"> {/* Adjusted for mobile */}
                        {/* Role Change */}
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.uid, e.target.value)}
                          disabled={updatingUserId === u.uid || u.uid === user.uid} // Prevent admin from changing their own role
                          className="px-3 py-1 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Status Toggle */}
                        {u.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateUserStatus(u.uid, 'blocked')}
                            disabled={updatingUserId === u.uid || u.uid === user.uid} // Prevent admin from blocking themselves
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-destructive-foreground bg-destructive hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Ban className="w-4 h-4 mr-1" /> Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u.uid, 'active')}
                            disabled={updatingUserId === u.uid}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminUsers;