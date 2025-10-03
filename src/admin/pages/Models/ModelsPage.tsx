import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToastController } from '../../components/ui/use-toast';
import { adminApi, Provider, AdminModel } from '../../../services/api.admin';
import { Plus, TestTube, RefreshCw, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';

interface ProviderFormData {
  name: string;
  type: string;
  endpoint: string;
  api_key: string;
  enabled: boolean;
}

export function ModelsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    type: 'vllm',
    endpoint: '',
    api_key: '',
    enabled: true
  });
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const { toast } = useToastController();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersData, modelsData] = await Promise.all([
        adminApi.getProviders().catch(() => []),
        adminApi.getModels().catch(() => [])
      ]);
      setProviders(providersData);
      setModels(modelsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays if backend is not available
      setProviders([]);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    setFormData({
      name: 'vLLM Server',
      type: 'vllm',
      endpoint: 'https://vllm.lchaty.com',
      api_key: '',
      enabled: true
    });
    setEditingProvider(null);
    setShowAddProvider(true);
  };

  const handleEditProvider = (provider: Provider) => {
    setFormData({
      name: provider.name,
      type: provider.type,
      endpoint: provider.endpoint || '',
      api_key: '', // Don't pre-fill for security
      enabled: provider.enabled
    });
    setEditingProvider(provider);
    setShowAddProvider(true);
  };

  const handleSaveProvider = async () => {
    try {
      if (editingProvider) {
        await adminApi.updateProvider({
          id: editingProvider.id,
          ...formData
        });
        toast({
          title: 'Success',
          description: 'Provider updated successfully'
        });
      } else {
        await adminApi.createProvider(formData);
        toast({
          title: 'Success',
          description: 'Provider added successfully'
        });
      }
      
      setShowAddProvider(false);
      loadData();
    } catch (error) {
      console.error('Failed to save provider:', error);
      toast({
        title: 'Backend Unavailable',
        description: 'Cannot save provider - backend service is not running',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    
    try {
      await adminApi.deleteProvider(providerId);
      toast({
        title: 'Success',
        description: 'Provider deleted successfully'
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive'
      });
    }
  };

  const handleTestProvider = async (providerId: string) => {
    try {
      setTestingProvider(providerId);
      const result = await adminApi.testProvider(providerId);
      
      toast({
        title: result.success ? 'Success' : 'Test Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Provider test failed:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test provider connection',
        variant: 'destructive'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSyncModels = async (providerId?: string) => {
    try {
      const result = await adminApi.syncModels(providerId);
      toast({
        title: 'Models Synced',
        description: `Added ${result.added} models, updated ${result.updated} models`
      });
      loadData();
    } catch (error) {
      console.error('Failed to sync models:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync models from provider',
        variant: 'destructive'
      });
    }
  };

  const toggleModelEnabled = async (modelId: string, enabled: boolean) => {
    try {
      await adminApi.updateModel(modelId, { enabled });
      toast({
        title: 'Success',
        description: `Model ${enabled ? 'enabled' : 'disabled'} successfully`
      });
      loadData();
    } catch (error) {
      console.error('Failed to update model:', error);
      toast({
        title: 'Error',
        description: 'Failed to update model',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Models & Providers</h1>
          <p className="text-muted-foreground">
            Manage LLM providers and configure available models
          </p>
        </div>
        <Button onClick={handleAddProvider}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Providers Section */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No providers configured.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {loading ? 'Loading...' : 'Add your first LLM provider to get started, or check if the backend service is running.'}
                </p>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{provider.name}</h3>
                      <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Badge variant="outline">{provider.type.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {provider.endpoint}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {provider.models.length} models available
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(provider.id)}
                      disabled={testingProvider === provider.id}
                    >
                      {testingProvider === provider.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncModels(provider.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProvider(provider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Models Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Models</CardTitle>
          <Button variant="outline" onClick={() => handleSyncModels()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All Models
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {models.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No models available. Configure a provider and sync models to get started.
              </p>
            ) : (
              models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{model.name}</h4>
                      <Badge variant="outline">{model.provider_name}</Badge>
                      {model.supports_streaming && (
                        <Badge variant="secondary">Streaming</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Model ID: {model.model_id}
                      {model.max_tokens && ` • Max tokens: ${model.max_tokens}`}
                    </p>
                  </div>
                  <Switch
                    checked={model.enabled}
                    onCheckedChange={(checked) => toggleModelEnabled(model.id, checked)}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
        <DialogContent className="sm:max-w-[525px] bg-white border-2">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Configure a new LLM provider to expand available models.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Provider Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My vLLM Server"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                Provider Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem value="vllm">vLLM</SelectItem>
                  <SelectItem value="openai">OpenAI Compatible</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endpoint" className="text-sm font-medium text-gray-700">
                API Endpoint
              </Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://vllm.lchaty.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api_key" className="text-sm font-medium text-gray-700">
                API Key (Optional)
              </Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Enter API key if required"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
              <Label htmlFor="enabled">Enable provider</Label>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setShowAddProvider(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProvider}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {editingProvider ? 'Update' : 'Add'} Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}