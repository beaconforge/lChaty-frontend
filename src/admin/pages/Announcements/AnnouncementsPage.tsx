import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/announcements';
import { Announcement } from '../../api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('everyone');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['announcements'], queryFn: listAnnouncements });

  const createMutation = useMutation({
    mutationFn: () => createAnnouncement({ title, body, audience }),
    onSuccess: () => {
      toast({ title: 'Announcement published' });
      setTitle('');
      setBody('');
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <p className="text-sm text-muted-foreground">Share updates with admins, moderators, or the entire organization.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={title} onChange={event => setTitle(event.target.value)} />
          <Input placeholder="Audience" value={audience} onChange={event => setAudience(event.target.value)} />
          <MarkdownEditor value={body} onChange={setBody} />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {data?.data?.map((announcement: Announcement) => (
          <Card key={announcement.id}>
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{announcement.title}</CardTitle>
                <CardDescription>
                  Audience: {announcement.audience} · {new Date(announcement.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => deleteMutation.mutate(announcement.id)}>
                Delete
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{announcement.body}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
