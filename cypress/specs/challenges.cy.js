const { faker } = require('@faker-js/faker');
const tv4 = require('tv4');

describe('Challenger session creation', () => {
    it.only('Should create a session and store a token as an env var', () => {
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
            // Verify that challenge is complited
            cy.verifyChallenge(8);
        });
    });

    // Issue a POST request to create a todo but fail validation on the `doneStatus` field
    it('POST /todos (400) doneStatus', () => {
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
                doneStatus: 2,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            // Verify response body
            expect(response.body.errorMessages[0]).to.eqls(
                'Failed Validation: doneStatus should be BOOLEAN but was NUMERIC'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(9);
        });
    });

    /* Issue a POST request to create a todo but fail length validation on the
     `title` field because your title exceeds maximum allowable characters. */
    it('POST /todos (400) title too long', () => {
        // Generate test data
        const randomTask = {
            title: faker.string.sample(51),
            doneStatus: true,
            description: faker.lorem.sentence()
        };

        cy.log(randomTask.title);
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
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            // Verify response body
            expect(response.body.errorMessages[0]).to.eqls(
                'Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(10);
        });
    });

    /*Issue a POST request to create a todo but fail length validation on the `description`
   because your description exceeds maximum allowable characters. */
    it('POST /todos (400) description too long', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(201)
        };

        cy.log(randomTask.title);
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
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            // Verify response body
            expect(response.body.errorMessages[0]).to.eqls(
                'Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(11);
        });
    });

    /* Issue a POST request to create a todo with 
       maximum length title and description fields. */
    it('POST /todos (201) max out content', () => {
        // Generate test data
        const randomTask = {
            title: faker.string.sample(50),
            doneStatus: true,
            description: faker.string.sample(200)
        };

        cy.log(randomTask.title);
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
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(201);
            // Verify that challenge is complited
            cy.verifyChallenge(12);
        });
    });

    /*Issue a POST request to create a todo but fail payload length validation
     on the `description` because your whole payload exceeds maximum allowable 5000 characters. */
    it('POST /todos (413) content too long', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(5001)
        };

        cy.log(randomTask.title);
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
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(413);
            // Verify response body
            expect(response.body.errorMessages[0]).to.eqls(
                'Error: Request body too large, max allowed is 5000 bytes'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(13);
        });
    });

    /*Issue a POST request to create a todo but fail validation
     because your payload contains an unrecognised field. */
    it('POST /todos (400) extra', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };

        cy.log(randomTask.title);
        cy.api({
            method: 'POST',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description,
                extra: 'val'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            // Verify response body
            expect(response.body.errorMessages[0]).to.eqls(
                'Could not find field: extra'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(14);
        });
    });
});

describe('Creation Challenges with PUT', () => {
    it('PUT /todos/{id} (400)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'PUT',
            url: '/todos/25',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            // Verify response body
            expect(response.body.errorMessages[0]).to.eqls(
                'Cannot create todo with PUT due to Auto fields id'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(15);
        });
    });
});

describe('Update Challenges with POST', () => {
    /* Issue a POST request to successfully update a todo*/
    it('POST /todos/{id} (200)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'POST',
            url: '/todos/2',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(200);
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
            // Verify that challenge is complited
            cy.verifyChallenge(16);
        });
    });

    /*Issue a POST request for a todo which does not exist. Expect to receive a 404 response.*/
    it('POST /todos/{id} (404', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'POST',
            url: '/todos/30',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(404);
            // Verify that challenge is complited
            cy.verifyChallenge(17);
        });
    });
});

describe('Update Challenges with PUT', () => {
    /*Issue a PUT request to update an existing todo with
   a complete payload i.e. title, description and donestatus.*/
    it('PUT /todos/{id} full (200)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'PUT',
            url: '/todos/2',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(200);
            // Verify response body
            expect(response.body.title).to.eqls(randomTask.title);
            expect(response.body.doneStatus).to.eqls(true);
            expect(response.body.description).to.eqls(randomTask.description);
            cy.fixture('json-schemas/PUT todo (200).json').then((schema) => {
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
            // Verify that challenge is complited
            cy.verifyChallenge(18);
        });
    });

    /* Issue a PUT request to update an existing todo with just mandatory items in payload i.e. title.*/
    it('PUT /todos/{id} partial (200)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'PUT',
            url: '/todos/2',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                title: randomTask.title
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(200);
            // Verify response body
            expect(response.body.title).to.eqls(randomTask.title);
            expect(response.body.doneStatus).to.eqls(false);
            expect(response.body.description).to.eqls('');
            cy.fixture('json-schemas/PUT todo (200).json').then((schema) => {
                // Validate the response body against the schema
                const isValid = tv4.validate(response.body, schema);
                expect(isValid).to.be.true;
            });
            // Verify that challenge is complited
            cy.verifyChallenge(19);
        });
    });

    /* Issue a PUT request to fail to update an existing
     todo because title is missing in payload.*/
    it('PUT /todos/{id} no title (400)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'PUT',
            url: '/todos/5',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            expect(response.body.errorMessages[0]).to.eqls(
                'title : field is mandatory'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(20);
        });
    });

    /*Issue a PUT request to fail to update an existing todo because id different in payload.*/
    it('PUT /todos/{id} no amend id (400)', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'PUT',
            url: '/todos/7',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            body: {
                id: 24,
                title: randomTask.title,
                doneStatus: randomTask.doneStatus,
                description: randomTask.description
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(400);
            expect(response.body.errorMessages[0]).to.eqls(
                'Can not amend id from 7 to 24'
            );
            // Verify that challenge is complited
            cy.verifyChallenge(21);
        });
    });
});

describe('DELETE Challenges', () => {
    /*Issue a DELETE request to successfully delete a todo*/
    it('DELETE /todos/{id} (200', () => {
        cy.api({
            method: 'DELETE',
            url: '/todos/7',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(200);
        });
        // Verify that item is deleted
        cy.api({
            method: 'GET',
            url: '/todos/7',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(404);
        });
        cy.verifyChallenge(22);
    });
});

describe('OPTIONS Challenges', () => {
    /*Issue an OPTIONS request on the `/todos` end point.
   You might want to manually check the
   'Allow' header in the response is as expected. */
    it('OPTIONS /todos (200)', () => {
        cy.api({
            method: 'OPTIONS',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            const allow = response.headers['allow'];
            expect(allow).to.eqls('OPTIONS, GET, HEAD, POST');
        });
        cy.verifyChallenge(23);
    });
});

describe('Accept Challenges', () => {
    /*Issue a GET request on the `/todos` end point with an `Accept` header
   of `application/xml` to receive results in XML format*/
    it('GET /todos (200) XML', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger'),
                Accept: 'application/xml'
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.headers['content-type']).to.eqls('application/xml');
        });
        cy.verifyChallenge(24);
    });

    /* Issue a GET request on the `/todos` end point with an `Accept` header
     of `application/json` to receive results in JSON format*/
    it('GET /todos (200) JSON', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger'),
                Accept: 'application/json'
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.headers['content-type']).to.eqls('application/json');
        });
        cy.verifyChallenge(25);
    });

    it('GET /todos (200) ANY', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger'),
                Accept: '*/*'
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.headers['content-type']).to.eqls('application/json');
        });
        cy.verifyChallenge(26);
    });

    /*Issue a GET request on the `/todos` end point with an `Accept` header of `application/xml, application/json` 
    to receive results in the preferred XML format*/
    it('GET /todos (200) XML pref', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger'),
                Accept: 'application/xml, application/json'
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.headers['content-type']).to.eqls('application/xml');
        });
        cy.verifyChallenge(27);
    });

    /*	
Issue a GET request on the `/todos` end point with no `Accept` header present in
 the message to receive results in default JSON format*/
    it('GET /todos (200) no accept', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.headers['content-type']).to.eqls('application/json');
        });
        cy.verifyChallenge(28);
    });

    /*	
Issue a GET request on the `/todos` end point with an `Accept` header
 `application/gzip` to receive 406 'NOT ACCEPTABLE' status code*/
    it.only('GET /todos (406)', () => {
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger'),
                Accept: 'application/gzip'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(406);
            expect(response.body.errorMessages[0]).to.eqls('Unrecognised Accept Type');
        });
        cy.verifyChallenge(29);
    });
});

describe('Content-Type Challenges', () => {
    /*Issue a POST request on the `/todos` end point to create a todo using Content-Type `application/xml`,
   and Accepting only XML ie. Accept header of `application/xml`*/
    it.only('POST /todos XML', () => {
        // Generate test data
        const randomTask = {
            title: faker.lorem.word(),
            doneStatus: true,
            description: faker.string.sample(20)
        };
        cy.api({
            method: 'POST',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger'),
                Accept: 'application/xml',
                'Content-Type': 'application/xml'
            },
            body:
            `<todo>
            <doneStatus>${randomTask.doneStatus}</doneStatus>
            <title>${randomTask.description}</title>
          </todo>`,
            
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eqls(201);
        });
        cy.verifyChallenge(30);
    });
});
