"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { PlusCircle, Users, Activity, CheckCircle, FileText, Send, Compass } from "lucide-react";

export default function Dashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("explore");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadToken() {
      if (isSignedIn) {
        const t = await getToken();
        setToken(t);
      }
    }
    loadToken();
  }, [isSignedIn, getToken]);

  const apiCall = async (endpoint: string, method: string, body?: any) => {
    if (!token) return alert("Not authenticated");
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      alert("API Error");
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <div className="text-white">Loading... Please sign in on the main page.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Activity className="text-indigo-500 w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">HackFlow</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem icon={Compass} label="Explore" active={activeTab === "explore"} onClick={() => setActiveTab("explore")} />
          <SidebarItem icon={Activity} label="Hackathons" active={activeTab === "hackathons"} onClick={() => setActiveTab("hackathons")} />
          <SidebarItem icon={Users} label="Teams" active={activeTab === "teams"} onClick={() => setActiveTab("teams")} />
          <SidebarItem icon={FileText} label="Submissions" active={activeTab === "submissions"} onClick={() => setActiveTab("submissions")} />
          <SidebarItem icon={Send} label="Invites" active={activeTab === "invites"} onClick={() => setActiveTab("invites")} />
        </nav>
        
        <div className="mt-auto border-t border-gray-800 pt-6 flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-gray-400">Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold capitalize text-gray-100">{activeTab} Management</h2>
            <p className="text-gray-400 mt-1">Manage all your {activeTab} operations directly from this dashboard.</p>
          </div>
        </header>

        {activeTab === "explore" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
              title="Find Open Hackathons" 
              description="Get a list of all active hackathons you can join."
              onClick={() => apiCall("hackathon/explore", "GET")}
              icon={Compass}
            />
            <ActionCard 
              title="Join Hackathon" 
              description="Enroll as a participant in an open hackathon using its ID."
              onClick={() => {
                const id = prompt("Enter the Hackathon ID you want to join:");
                if (id) apiCall("hackathon/enroll", "POST", { hackathonId: id });
              }}
              icon={CheckCircle}
            />
          </div>
        )}

        {activeTab === "hackathons" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
              title="Create Hackathon" 
              description="Deploy a new hackathon event."
              onClick={() => apiCall("hackathon", "POST", { name: "New Hackathon", theme: "AI" })}
              icon={PlusCircle}
            />
             <ActionCard 
              title="Update Status" 
              description="Change status of a specific hackathon."
              onClick={() => apiCall("hackathon/status/123", "POST", { status: "ACTIVE" })}
              icon={CheckCircle}
            />
          </div>
        )}

        {activeTab === "teams" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
              title="Create Team" 
              description="Form a new team for a hackathon."
              onClick={() => apiCall("team", "POST", { name: "Cyber Knights" })}
              icon={Users}
            />
             <ActionCard 
              title="Send Team Invite" 
              description="Invite members to your team."
              onClick={() => apiCall("team/invite", "POST", { email: "member@example.com" })}
              icon={Send}
            />
            <ActionCard 
              title="Accept Team Invite" 
              description="Accept a pending team invite."
              onClick={() => apiCall("team/invite/accept", "POST", { inviteId: "invite_123" })}
              icon={CheckCircle}
            />
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ActionCard 
              title="Create Submission" 
              description="Submit your project to the hackathon."
              onClick={() => apiCall("submission", "POST", { projectUrl: "https://github.com/..." })}
              icon={PlusCircle}
            />
            <ActionCard 
              title="Update Submission" 
              description="Modify an existing project submission."
              onClick={() => apiCall("submission", "PATCH", { id: "sub_123", status: "completed" })}
              icon={FileText}
            />
             <ActionCard 
              title="View My Submissions" 
              description="Retrieve all your past and active submissions."
              onClick={() => apiCall("submission/my", "GET")}
              icon={Activity}
            />
          </div>
        )}

        {activeTab === "invites" && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
             title="Send Global Invite" 
             description="Invite someone to the platform (e.g. Judge)."
             onClick={() => apiCall("invite", "POST", { email: "judge@example.com", role: "JUDGE" })}
             icon={Send}
           />
           <ActionCard 
             title="Accept Global Invite" 
             description="Accept an invitation to join as a specific role."
             onClick={() => apiCall("invite/accept", "POST", { token: "secret_token" })}
             icon={CheckCircle}
           />
         </div>
        )}
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left w-full ${
        active ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ActionCard({ title, description, onClick, icon: Icon }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-indigo-500 transition-all cursor-pointer group flex flex-col items-start gap-4" onClick={onClick}>
       <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
          <Icon className="w-6 h-6 text-gray-300 group-hover:text-indigo-400" />
       </div>
       <div>
         <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
         <p className="text-sm text-gray-400 mt-1">{description}</p>
       </div>
       <button className="mt-auto px-4 py-2 bg-gray-800 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors w-full border border-gray-700 hover:border-indigo-500">
         Execute API
       </button>
    </div>
  );
}
