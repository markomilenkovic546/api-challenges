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

    
});
