const request = require('supertest');
const jwt = require('jwt-simple');
const { testing } = require('../../knexfile');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, passwd: '123456' })
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Deve inserir uma conta com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Acc #1', user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    });
});

test('Nao deve inserir uma conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Nome é um atributo obrigatório');
    });
})

test('Deve listar todas as contas', () => {
  return app.db('accounts')
    .insert({ name: 'Acc list', user_id: user.id })
    .then(() => {
      request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
});

test('Deve retornar uma conta por ID', () => {
  return app.db('accounts')
    .insert({ name: 'Acc By ID', user_id: user.id }, ['id'])
    .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc By ID');
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Deve alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
    .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc Updated' })
      .set('authorization', `bearer ${user.token}`))
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc Updated');
    });
});

test('Deve remover uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc to Delete', user_id: user.id }, ['id'])
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then(res => {
      expect(res.status).toBe(204);
    });
});

test.skip('Nao deve inserir uma conta de nome duplicado, para o mesmo usuario', () => { });

test.skip('Deve listar apenas as contas do usuario', () => { });

test.skip('Nao deve retornar uma conta de outro usuário', () => { });

test.skip('Nao deve alterar uma conta de outro usuário', () => { });

test.skip('Nao deve remover uma conta de outro usuário', () => { });