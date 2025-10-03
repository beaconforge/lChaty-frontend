import { ConversationList } from '../../components/Chat/ConversationList';
import { MessageList } from '../../components/Chat/MessageList';
import { Composer } from '../../components/Chat/Composer';
import { ChatShell } from '../../components/Chat/ChatShell';

export default function ChatPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <ChatShell
        left={<ConversationList />}
        center={
          <div className="flex flex-1 flex-col">
            <MessageList />
            <Composer />
          </div>
        }
        right={<div className="h-full p-4 text-sm text-muted-foreground">Conversation tools coming soon.</div>}
      />
    </div>
  );
}
