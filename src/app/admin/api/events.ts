export type AdminEvent = {
  type: string;
  payload: unknown;
};

export function subscribeToAdminEvents(onEvent: (event: AdminEvent) => void) {
  const source = new EventSource('/api/admin/events', { withCredentials: true } as any);
  source.onmessage = event => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (error) {
      console.error('Failed to parse admin event', error);
    }
  };
  return () => source.close();
}
