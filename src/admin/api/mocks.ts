import { http } from './http';
import MockAdapter from 'axios-mock-adapter';

const mockData = {
  users: Array.from({ length: 25 }).map((_, index) => ({
    id: `user-${index + 1}`,
    username: `user${index + 1}`,
    email: `user${index + 1}@example.com`,
    roles: ['admin'],
    status: index % 2 === 0 ? 'active' : 'pending',
    createdAt: new Date(Date.now() - index * 3600_000).toISOString(),
  })),
};

export function enableMocks() {
  const mock = new MockAdapter(http, { delayResponse: 400 });
  mock.onGet('/admin/users').reply(config => {
    const page = Number(config.params?.page ?? 0);
    const limit = Number(config.params?.limit ?? 10);
    const start = page * limit;
    const data = mockData.users.slice(start, start + limit);
    return [200, { data, total: mockData.users.length, page, limit }];
  });

  mock.onGet(/\/admin\/users\/user-/).reply(config => {
    const id = config.url?.split('/').pop();
    const user = mockData.users.find(item => item.id === id);
    return user ? [200, user] : [404];
  });

  mock.onAny().passThrough();

  return mock;
}
