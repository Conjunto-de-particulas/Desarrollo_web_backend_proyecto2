// tests/userController.test.js
const request = require('supertest');
const app = require('../app'); // Adjust if needed
const mongoose = require('mongoose');
const User = require('../models/user');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/library_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('User Controller', () => {
  test('Register success', async () => {
    const res = await request(app).post('/users/register').send({ name: 'Test', email: 'test@example.com', password: 'pass' });
    expect(res.status).toBe(201);
  });

  test('Register failure - missing fields', async () => {
    const res = await request(app).post('/users/register').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  // Add more tests for each function: login success/fail, getUser success/fail, etc.
  // For auth, need to mock or get token first.
});

// Similar for other controllers: bookController.test.js, reservationController.test.js
// Each with success and at least one validation failure.