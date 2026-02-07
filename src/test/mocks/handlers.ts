import { http, HttpResponse } from 'msw';

// Use /api as the base since that's what the axios instance uses by default
const API_BASE = '/api';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@test.com',
  fullName: 'Test User',
  role: 'User',
  emailVerified: true,
  createdAt: new Date().toISOString(),
};

const mockPlan = {
  id: 'free-plan-id',
  name: 'Free',
  slug: 'free',
  priceMonthly: 0,
  priceYearly: 0,
  creditsMonthly: 10,
  features: [{ key: 'projects', value: '1', displayName: 'Projects', isVisible: true }],
};

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  brandName: 'Test Brand',
  industry: 'Technology',
  status: 'Active',
  createdAt: new Date().toISOString(),
};

const mockTemplate = {
  id: 'test-template-id',
  name: 'Social Post',
  category: 'SocialPost',
  creditCost: 1,
  inputsSchema: '{"topic": "string"}',
};

const mockContentItem = {
  id: 'test-content-id',
  projectId: 'test-project-id',
  templateName: 'Social Post',
  content: 'Generated test content',
  status: 'Draft',
  creditsConsumed: 1,
  createdAt: new Date().toISOString(),
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/register`, async () => {
    return HttpResponse.json({
      userId: 'new-user-id',
      message: 'Registration initiated. Check your email for OTP.',
    });
  }),

  http.post(`${API_BASE}/auth/login`, async () => {
    return HttpResponse.json({
      userId: 'test-user-id',
      message: 'OTP sent to your email',
    });
  }),

  http.post(`${API_BASE}/auth/verify-otp`, async () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    return HttpResponse.json({
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
  }),

  http.get(`${API_BASE}/auth/me`, async () => {
    return HttpResponse.json(mockUser);
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Plans endpoints
  http.get(`${API_BASE}/plans`, async () => {
    return HttpResponse.json([mockPlan]);
  }),

  http.get(`${API_BASE}/plans/:id`, async () => {
    return HttpResponse.json(mockPlan);
  }),

  // Subscription endpoints
  http.get(`${API_BASE}/subscription`, async () => {
    return HttpResponse.json({
      id: 'test-subscription-id',
      planId: 'free-plan-id',
      planName: 'Free',
      status: 'Active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
    });
  }),

  // Credits endpoints
  http.get(`${API_BASE}/credits`, async () => {
    return HttpResponse.json({
      allocated: 10,
      used: 2,
      available: 8,
    });
  }),

  http.get(`${API_BASE}/credits/transactions`, async () => {
    return HttpResponse.json([
      {
        id: 'txn-1',
        amount: 10,
        type: 'Allocation',
        referenceType: 'Subscription',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  // Projects endpoints
  http.get(`${API_BASE}/projects`, async () => {
    return HttpResponse.json([mockProject]);
  }),

  http.get(`${API_BASE}/projects/:id`, async () => {
    return HttpResponse.json(mockProject);
  }),

  http.post(`${API_BASE}/projects`, async () => {
    return HttpResponse.json(mockProject, { status: 201 });
  }),

  http.put(`${API_BASE}/projects/:id`, async () => {
    return HttpResponse.json({ ...mockProject, name: 'Updated Project' });
  }),

  http.delete(`${API_BASE}/projects/:id`, async () => {
    return HttpResponse.json({ message: 'Project archived' });
  }),

  // Templates endpoints
  http.get(`${API_BASE}/templates`, async () => {
    return HttpResponse.json([mockTemplate]);
  }),

  http.get(`${API_BASE}/templates/:id`, async () => {
    return HttpResponse.json(mockTemplate);
  }),

  // Content endpoints
  http.post(`${API_BASE}/content/generate`, async () => {
    return HttpResponse.json(mockContentItem);
  }),

  http.get(`${API_BASE}/content`, async () => {
    return HttpResponse.json([mockContentItem]);
  }),

  http.get(`${API_BASE}/content/:id`, async () => {
    return HttpResponse.json(mockContentItem);
  }),

  http.put(`${API_BASE}/content/:id`, async () => {
    return HttpResponse.json({ ...mockContentItem, content: 'Updated content' });
  }),

  http.delete(`${API_BASE}/content/:id`, async () => {
    return HttpResponse.json({ message: 'Content item deleted' });
  }),

  // Integrations endpoints
  http.get(`${API_BASE}/integrations/accounts`, async () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/integrations/available`, async () => {
    return HttpResponse.json([
      { platform: 'X', displayName: 'X (Twitter)', capabilities: ['text'] },
      { platform: 'Instagram', displayName: 'Instagram', capabilities: ['image', 'video'] },
    ]);
  }),

  // Posts endpoints
  http.get(`${API_BASE}/posts`, async () => {
    return HttpResponse.json([]);
  }),

  http.post(`${API_BASE}/posts/publish`, async () => {
    return HttpResponse.json({
      postId: 'new-post-id',
      jobs: [
        {
          id: 'job-1',
          connectedAccountId: 'account-1',
          platformName: 'X',
          destinationName: 'Main Profile',
          status: 'Published',
          publishedAt: new Date().toISOString(),
          platformPostId: 'twitter-post-123',
          platformUrl: 'https://x.com/user/status/123',
        },
      ],
      successful: 1,
      failed: 0,
    });
  }),
];
