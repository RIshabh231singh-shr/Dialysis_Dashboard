const request = require('supertest');
const app = require('../src/app');

// Mock dependencies to isolate the API logic
jest.mock('../src/models/Session');
jest.mock('../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
  on: jest.fn()
}));

const Session = require('../src/models/Session');
const redisClient = require('../src/config/redis');

describe('Session API Routes', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/session/today', () => {
        it('should return today\'s sessions from the database on a cache miss', async () => {
            // Mock Redis cache MISS
            redisClient.get.mockResolvedValue(null);
            redisClient.set.mockResolvedValue('OK');

            // Mock MongoDB chained query
            const mockSessions = [
                { _id: 'session1', status: 'IN_PROGRESS', patientId: { name: 'John Doe' } }
            ];

            Session.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockSessions)
            });

            const response = await request(app).get('/api/session/today');
            
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.fromCache).toBe(false); // Indicates DB fetch
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].status).toBe('IN_PROGRESS');
            
            // Verify Redis was updated
            expect(redisClient.set).toHaveBeenCalled();
        });

        it('should return from Redis cache if available without hitting the database', async () => {
            // Mock Redis cache HIT
            const cachedSessions = [{ _id: 'session2', status: 'COMPLETED' }];
            redisClient.get.mockResolvedValue(JSON.stringify(cachedSessions));

            const response = await request(app).get('/api/session/today');

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.fromCache).toBe(true); // Indicates Cache fetch
            expect(response.body.data[0]._id).toBe('session2');
            
            // Verify DB find was completely skipped
            expect(Session.find).not.toHaveBeenCalled();
        });
    });
});
