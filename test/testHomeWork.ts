import { expect } from "chai";
const frisby = require("frisby");
const faker = require('faker');

const baseUrl = 'http://ip-5236.sunline.net.ua:30020';
const userRoute = '/api/user/';
const registerRoute = '/users/register/';
const loginRoute = '/users/login/';
const userListRoute = '/api/users/';



const getToken = async () => {
    let resp = await frisby.post(
        `${baseUrl}${loginRoute}`,
        {
            json: true,
            body: {
                password: "nata@nata.nata",
                email: "nata@nata.nata"
            }
        }
    );
    return JSON.parse(resp.body).token;
};

const getUserId = async () => {
    let resp = await frisby.post(
        `${baseUrl}${loginRoute}`,
        {
            json: true,
            body: {
                password: "nata@nata.nata",
                email: "nata@nata.nata"
            }
        }
    );
    return JSON.parse(resp.body).id;
};

const getTokenAdmin = async () => {
    let resp = await frisby.post(
        `${baseUrl}${loginRoute}`,
        {
            json: true,
            body: {
                email: "test@test.com",
                password: "123456"
            }
        }
    );
    return JSON.parse(resp.body).token;
};

const getIdNewUser = async () => {
    let resp = await frisby.post(
        `${baseUrl}${registerRoute}`,
        {
            json: true,
            body: {
                username: faker.name.firstName(),
                password: faker.internet.email(),
                email: faker.internet.email()
            }
        }
    );
    expect("status", '200');
    return JSON.parse(resp.body).id;
};

describe("Main functionality", function() {

    it("should check user logged in", async function() {
        const resp = await frisby.get(
            `${baseUrl}${userRoute}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getToken()}`
                },
            }
        );
        expect(resp.status).to.eq(200);
        console.log("You are logged in!", resp.body);
        expect(JSON.parse(resp.body)).to.be.an('object').that.has.all.keys('_id','createdAt', 'username', 'emails', 'profile', 'authenticationMethod')
    });

    it("should return 400 error after loging non-logged in user", async function() {
        const resp = await frisby.get(
            `${baseUrl}${userRoute}`,
            {
                json: true,
                headers: {
                    'Authorization': 'Bearer dccdcdcdcdcd'
                },
            }
        );
        expect(JSON.parse(resp.body).statusCode).to.eq(401);
        expect(JSON.parse(resp.body).error).to.eq('Unauthorized');
        console.log("Incorrect token!", resp.body);
    });


    it("should retrieves the user list", async function() {
        const resp = await frisby.get(
            `${baseUrl}${userListRoute}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getTokenAdmin()}`
                },
            }
        );
        expect(resp.status).to.eq(200);
        console.log("User list retrieved", resp.body);
    });

    it("should return 403 status error with non-admin Auth", async function() {
        const resp = await frisby.get(
            `${baseUrl}${userListRoute}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getToken()}`
                },
            }
        );
        expect(JSON.parse(resp.body).statusCode).to.eq(403);
        expect(JSON.parse(resp.body).error).to.eq('Forbidden');
        console.log("Forbidden access! ", resp.body);
    });


    it("should retrieve information about a user.", async function() {
        console.log(`${baseUrl}${userListRoute}${await getUserId()}`);
        const resp = await frisby.get(
            `${baseUrl}${userListRoute}${await getUserId()}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getTokenAdmin()}`
                },
            }
        );
        expect(resp.status).to.eq(200);
        expect(resp.body).to.be.not.null;
        console.log("Retrieve information about a user", resp.body);
    });

    it("shouldn't return any information without non-admin token", async function() {
        const resp = await frisby.get(
            `${baseUrl}${userListRoute}${await getUserId()}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getToken()}`
                },
            }
        );
        expect(JSON.parse(resp.body).statusCode).to.eq(401);
        expect(JSON.parse(resp.body).error).to.eq('Unauthorized');
        console.log("Unauthorized access! ", resp.body);
    });

    it("should delete user successfully", async function() {
        const resp = await frisby.delete(
            `${baseUrl}${userListRoute}${await getIdNewUser()}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getTokenAdmin()}`
                },
            }
        );
        expect(resp.status).to.eq(200);
        expect(JSON.parse(resp.body)).to.be.an('object').that.has.all.keys('_id');
        console.log(resp.body)
    });

    it("shouldn't delete user with invalid id", async function() {
        console.log(`${baseUrl}${userListRoute}scscnkksnJJkscknsk`);
        const resp = await frisby.delete(
            `${baseUrl}${userListRoute}${await getUserId()}`,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${await getTokenAdmin()}`
                },
            }
        );
        expect(JSON.parse(resp.body)).to.have.property('_id', 'undefined');
        console.log("No deletion", resp.body);
    });
});