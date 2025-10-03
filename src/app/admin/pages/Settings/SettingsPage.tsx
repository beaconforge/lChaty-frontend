import { useAuth } from '../../auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and environment preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>These settings are synchronized with your account directory.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input value={user?.username ?? ''} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={user?.email ?? ''} readOnly />
          </div>
          <Button disabled>Update (managed by SSO)</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>Information about the backend cluster powering this admin console.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <div className="text-muted-foreground">API base</div>
            <div className="font-medium">https://chat-backend.lchaty.com</div>
          </div>
          <div>
            <div className="text-muted-foreground">Admin origin</div>
            <div className="font-medium">https://local.admin.lchaty.com:5173</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
