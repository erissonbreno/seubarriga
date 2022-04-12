const request = require('supertest');
const { test } = require('../../knexfile');
const app = require('../../src/app');


test('Deve listar todos os usuarios', () => {
  request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    })
});

test('Deve inserir usuario com sucesso', () => {
  const mail = `${Date.now()}@mail.com`;
  return request(app).post('/users')
    .send({ name: 'Walter Mitty', mail, passwd: '123456' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter Mitty');
    });
});

// UTILIZANDO PROMISES REQUEST.THEN
test('Nao deve inserir usuario sem nome', () => request(app).post('/users')
  .send({ mail: 'teste@mail.com', passwd: '123456' })
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nome é um atributo obrigatório');
  }));

// UTILIZANDO ASYNC AWAIT
test('Nao deve inserir usuario sem email', async () => {
  const result = await request(app).post('/users')
    .send({ name: 'Walter Mitty', passwd: '123456' });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatório');
});

// UTILIZANDO DONE
test('Nao deve inserir usuario sem senha', (done) => {
  request(app).post('/users')
    .send({ name: 'Walter Mitty', mail: 'test@123.com' })
    .then((res) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Senha é um atributo obrigatório');
      done();
    })
});

test.only('Nao deve inserir usuario com email existente', () => {
  return request(app).post('/users')
    .send({ name: 'Walter Mitty', mail, passwd: '123456' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.name.error).toBe('Já existe um usuário com esse email');
    });
})