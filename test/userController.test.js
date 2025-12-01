
const request = require('supertest');
const app = require('../app');
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


});
