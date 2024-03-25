const { faker } = require('@faker-js/faker');
const tv4 = require('tv4');

describe('Challenger session creation', () => {
    it('Should create a session and store a token as an env var', () => {
        cy.api({
            method: 'POST',
            url: '/challenger',
            body: {}
        }).then((response) => {
            const xChallengerValue = response.headers['x-challenger'];
            // Set X-CHALLENGER value as Cypress environment variable
            Cypress.env('X-Challenger', xChallengerValue);
            cy.log(Cypress.env('X-Challenger'));
        });
    });

    /* Issue a GET request on the `/challenges` end point*/
    it('GET /challenges (200)', () => {
        cy.api({
            method: 'GET',
            url: '/challenges',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.body.challenges[0].status).to.eqls(true);
            expect(response.body.challenges[1].status).to.eqls(true);
        });
    });
});

describe('GET Challenges', () => {
    // Issue a GET request on the `/todos` end point
    it('GET /todos (200)', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            cy.fixture('json-schemas/GET todos (200).json').then((schema) => {
                // Validate the response body against the schema
                const isValid = tv4.validate(response.body, schema);
                expect(isValid).to.be.true;
            });
            // Verify that challenge is complited
            cy.verifyChallenge(2);
        });
    });

    // Issue a GET request on the `/todo` end point should 404 because nouns should be plural
    it('GET /todo (404) not plural', () => {
        cy.api({
            method: 'GET',
            url: '/todo',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(404);
            // Verify that challenge is complited
            cy.verifyChallenge(3);
        });
    });
    // Issue a GET request on the `/todos/{id}` end point to return a specific todo
    it('GET /todos/{id} (200)', () => {
        cy.api({
            method: 'GET',
            url: '/todos/5',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.body.todos.length).to.eqls(1);
            expect(response.body.todos[0].id).to.eqls(5);
            cy.fixture('json-schemas/GET todos (200).json').then((schema) => {
                // Validate the response body against the schema
                const isValid = tv4.validate(response.body, schema);
                expect(isValid).to.be.true;
            });
            // Verify that challenge is complited
            cy.verifyChallenge(4);
        });
    });

    // Issue a GET request on the `/todos/{id}` endpoint for a todo that does not exist
    it('GET /todos/{id} (404))', () => {
        cy.api({
            method: 'GET',
            url: '/todos/50',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(404);
            // Verify that challenge is complited
            cy.verifyChallenge(5);
        });
    });

    /*Issue a GET request on the `/todos` end point with a query filter 
     to get only todos which are 'done'. 
    There must exist both 'done' and 'not done' todos, to pass this challenge. */
    it('GET /todos (200) ?filter', () => {
        // Generate data for payload
        const randomTask = {
            title: faker.lorem.words(),
            doneStatus: true,
            description: faker.lorem.sentence()
        };
        // Create todo task to have tasks with both statuses
        cy.createdTodoTask(
            randomTask.title,
            randomTask.doneStatus,
            randomTask.description
        );
        cy.api({
            method: 'GET',
            url: '/todos?doneStatus=true',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.body.todos.length).to.eqls(1);
            expect(response.body.todos[0].title).to.eqls(randomTask.title);
            expect(response.body.todos[0].doneStatus).to.eqls(true);
            expect(response.body.todos[0].description).to.eqls(randomTask.description);
            cy.fixture('json-schemas/GET todos (200).json').then((schema) => {
                // Validate the response body against the schema
                const isValid = tv4.validate(response.body, schema);
                expect(isValid).to.be.true;
            });
            // Verify that challenge is complited
            cy.verifyChallenge(6);
        });
    });
});

describe('HEAD Challenges', () => {
    // Issue a HEAD request on the `/todos` end point
    it('HEAD /todos (200)', () => {
        cy.api({
            method: 'HEAD',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            // Verify that challenge is complited
            cy.verifyChallenge(7);
        });
    });
});

describe('Creation Challenges with POST', () => {
    // Issue a POST request to successfully create a todo
    it('POST /todos (201)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.words(),
            doneStatus: true,
            description: faker.lorem.sentence()
        };
        cy.api({
            method: 'POST',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            }
        }).then((response) => {
            expect(response.status).to.eqls(201);
            // Verify response body
            expect(response.body.title).to.eqls(randomTask.title);
            expect(response.body.doneStatus).to.eqls(true);
            expect(response.body.description).to.eqls(randomTask.description);
            cy.fixture('json-schemas/POST todo (201).json').then((schema) => {
                // Validate the response body against the schema
                const isValid = tv4.validate(response.body, schema);
                expect(isValid).to.be.true;
            });
            cy.verifyThatTaskIsInsertedInDB(
                response.body.id,
                response.body.title,
                response.body.doneStatus,
                response.body.description
            );
        });
    });
});
