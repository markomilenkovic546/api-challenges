Cypress.Commands.add('verifyChallenge', (index) => { 
    cy.api({
        method: 'GET',
        url: '/challenges',
        headers: {
            'X-Challenger': Cypress.env('X-Challenger')
        }
    }).then((response) => {
        expect(response.body.challenges[index].status).to.eqls(true);
        
    });
});

