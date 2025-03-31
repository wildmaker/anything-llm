import React from 'react';
import { useParams } from 'react-router-dom';
import PasswordModal, { usePasswordModal } from '@/components/Modals/Password';
import { FullScreenLoader } from '@/components/Preloader';
import WorkspaceChatComponent from '@/components/WorkspaceChat';
import Sidebar from '@/components/Sidebar';
import LobeNavBar from '@/components/LobeNavBar';

export default function WorkspaceChat() {
  const { loading, requiresAuth, mode } = usePasswordModal();

  if (loading) {
    return <FullScreenLoader />;
  }
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }
  return <ShowWorkspaceChat />;
}

function ShowWorkspaceChat() {
  const { slug, threadSlug = null } = useParams();
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-theme-bg-primary">
      <div className="flex w-full h-full overflow-hidden">  
        <LobeNavBar />
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <WorkspaceChatComponent
            slug={slug}
            threadSlug={threadSlug}
          />
        </div>
      </div>
    </div>
  );
} 