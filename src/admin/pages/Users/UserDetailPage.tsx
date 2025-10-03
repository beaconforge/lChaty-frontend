import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUser, updateUser, resetPassword } from '../../api/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../components/ui/toast';
import { LoadingScreen } from '../../components/LoadingScreen';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  status: z.enum(['active', 'pending', 'disabled']),
});

type FormValues = z.infer<typeof schema>;

export function UserDetailPage() {
  const params = useParams();
  const userId = params.id!;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateUser(userId, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast({ title: 'Profile updated' });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: data
      ? {
          name: data.name ?? data.username,
          title: data.title ?? '',
          status: (data.status as 'active' | 'pending' | 'disabled') ?? 'active',
        }
      : undefined,
  });

  if (isLoading || !data) {
    return <LoadingScreen message="Loading user" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.username}</CardTitle>
          <CardDescription>{data.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(values => {
              mutation.mutate(values);
            })}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <Input {...form.register('name')} />
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input {...form.register('title')} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/40 p-4">
              <div>
                <div className="font-medium">Active status</div>
                <div className="text-sm text-muted-foreground">Toggle to disable user access immediately.</div>
              </div>
              <Switch
                checked={form.watch('status') === 'active'}
                onCheckedChange={checked => form.setValue('status', checked ? 'active' : 'disabled')}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={() => {
              void resetPassword(userId);
              toast({ title: 'Password reset queued', description: 'The user will receive an email shortly.' });
            }}
          >
            Reset password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
