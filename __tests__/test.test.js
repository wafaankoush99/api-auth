'use strict';

'user strict'
process.env.SECRET = 'toes';
const supergoose = require('@code-fellows/supergoose');
const server = require('../src/server').server
const { expect } = require('@jest/globals');

const request = supergoose(server);

describe('Auth Router', () => {

    it('Should Got A Welcome Message', async () => {
        let route = '/';
        const response = await request.get(route);
        expect(response.status).toBe(200);
        expect(response.text).toBe('Welcome to Auth App :)');
    });


    it('Should Get 404 Status and error message', async ()=>{
        const response = await request.get('/foo');
        expect(response.status).toBe(404);
        expect(response.text).toEqual('{"error":"Resource Not Found"}');
      });

      let user = {
        "username":"nai",
        "password":"1234",
        "role":"admin"
    }

    it('Should Get 201 Status and an object when sign up', async ()=>{
        const response = await request.post('/signup').send(user);
        expect(response.status).toBe(201);
        expect(response.body.token).toBeTruthy();
        expect(response.body.user._id).toBeTruthy();
        expect(response.body.user.username).toBe("nai");
        expect(response.body.user.role).toBe("admin");
      });

    it('Should Get 200 Status and an object when signin', async ()=>{
        const response = await request.post('/signin').auth('nai', '1234');
        expect(response.status).toBe(200);
        expect(response.body.token).toBeTruthy();
        expect(response.body.user._id).toBeTruthy();
        expect(response.body.user.username).toBe("nai");
        expect(response.body.user.role).toBe("admin");
      });

      it("should get 200 and array of usernames when get /users", async() => {
        let send = await request.post('/signin').auth('nai', '1234');
        let token = ` Bearer ${send.body.token}`;
        let test = await request.get('/users').set(`Authorization`, `${token}`);
        expect(test.body[0]).toEqual('nai');
        expect(test.status).toEqual(200)
    });

      it("should get welcome message when go to secret area", async() => {
        let send = await request.post('/signin').auth('nai', '1234');
        let token = `Bearer ${send.body.token}`;
        let test = await request.get('/secret').set(`Authorization`, `${token}`);
        expect(test.text).toEqual('Welcome to the secret area');
        expect(test.status).toEqual(200)
    });


    let clothes = {
        name: "jacket",
        size: "x-large",
        color: "black",
      };
      
      let clothesEditing = {
        name: "jacket",
        size: "x-large",
        color: "pink",
      };
      
        let id;
        it('should create a new item using POST req', async () => {
          const res = await request.post(`/api/v1/clothes`).send(clothes);
          expect(res.status).toEqual(201);
          expect(res.body[Object.keys(clothes)[1]]).toEqual(Object.values(clothes)[1]);
          expect(res.body[Object.keys(clothes)[2]]).toEqual(Object.values(clothes)[2]);
          expect(res.body._id.length).toBeGreaterThan(0);
      
          id = res.body._id;
        });
      
        it('should update a item using PUT req', async () => {
          const res = await request.put(`/api/v1/clothes/${id}`).send(clothesEditing);
          expect(res.status).toEqual(200);
          expect(res.body[Object.keys(clothesEditing)[1]]).toEqual((Object.values(clothesEditing)[1]));
      
        });
      
        it('should Read a list of records using GET', async () => {
          const res = await request.get(`/api/v1/clothes`);
          expect(res.status).toBe(200);
          expect(res.text.length).toBeGreaterThan(0);
        });
      
        it('should do not read a record using DELETE', async()=>{
          const res = await request.delete(`/api/v1/clothes/${id}`).send(clothes);
          expect(res.status).toBe(200);
        });


        let food = {
            name: "pizza",
            calories: 400,
          };
          
          let foodEditing = {
            name: "pizza",
            calories: 500,
          };


        it('should create a new item using POST req', async () => {
            const res = await request.post(`/api/v1/food`).send(food);
            expect(res.status).toEqual(201);
            expect(res.body[Object.keys(food)[1]]).toEqual(Object.values(food)[1]);
            expect(res.body[Object.keys(food)[2]]).toEqual(Object.values(food)[2]);
            expect(res.body._id.length).toBeGreaterThan(0);
            id = res.body._id;
          });
        
          it('should update a item using PUT req', async () => {
            const res = await request.put(`/api/v1/food/${id}`).send(foodEditing);
            expect(res.status).toEqual(200);
            expect(res.body[Object.keys(foodEditing)[1]]).toEqual((Object.values(foodEditing)[1]));
          });
        
          it('should Read a list of records using GET', async () => {
            const res = await request.get(`/api/v1/food`);
            expect(res.status).toBe(200);
            expect(res.text.length).toBeGreaterThan(0);
          });
        
          it('should do not read a record using DELETE', async()=>{
            const res = await request.delete(`/api/v1/food/${id}`).send(food);
            expect(res.status).toBe(200);
          });

          //////////////////////////////////

          it("should give permission to add an item", async() => {
            // let siginUp = await request.post('/signup').send(user);
            let response = await request.post('/signin').auth(user.username, user.password);
            let token = ` Bearer ${response.body.token}`;
            let test = await request.post('/api/v2/clothes').set(`Authorization`, token).send(clothes);
            expect(test.body.color).toEqual("black");
            expect(test.status).toEqual(201);
        });
    
        it("should give a permission to get all items", async() => {
            let response = await request.post('/signin').auth(user.username, user.password);
            let token = `Bearer ${response.body.token}`
            let test = await request.get('/api/v2/clothes').set(`Authorization`, token)
            expect(test.body[0].name).toEqual("jacket");
            expect(test.status).toEqual(200);
        });
    
        it("should give a permission to get one item", async() => {
            let response = await request.post('/signin').auth(user.username, user.password);
            let token = `Bearer ${response.body.token}`
            let response2 = await request.post('/api/v2/clothes').set(`Authorization`, token).send(clothes);
            let id = response2.body._id
            let idId = await request.get(`/api/v2/clothes/${id}`).set(`Authorization`, token);
            expect(idId.status).toEqual(200);
            expect(idId.text).toBeDefined();;
        });
    
        it("should give a permission to update", async() => {
            let response = await request.post('/signin').auth(user.username, user.password);
            let token = `Bearer ${response.body.token}`
            let postSomething = await request.post('/api/v2/clothes').set(`Authorization`, token).send(clothes);
            let id = postSomething.body._id
            // let clothesEditing = {
            //     name: "jacket",
            //     size: "x-large",
            //     color: "pink",
            //   };
            let updated = await request.put(`/api/v2/clothes/${id}`).set(`Authorization`, token).send(clothesEditing);
            expect(updated.status).toEqual(200);
            expect(updated.body.size).toEqual("x-large");;
        });
    
    
        it("should give a permission to delete", async() => {
            let response = await request.post('/signin').auth(user.username, user.password);
            let token = `Bearer ${response.body.token}`
            let response2 = await request.post('/api/v2/clothes').set(`Authorization`, token).send(clothes);
            let id = response2.body._id
            let deleted = await request.delete(`/api/v2/clothes/${id}`).set(`Authorization`, token);
            let idId = await request.get(`/api/v2/clothes/${id}`).set(`Authorization`, token);
            expect(deleted.status).toEqual(200);
            expect(deleted.data).not.toBeDefined();
            expect(idId.body).toBeNull();
    
        });


})




