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

Cypress.Commands.add('createdTodoTask', (title, doneStatus, description) => {
    cy.api({
        method: 'POST',
        url: '/todos',
        headers: {
            'X-Challenger': Cypress.env('X-Challenger')
        },
        body: {
            title: title,
            doneStatus: doneStatus,
            description: description
        }
    }).then((response) => {
        expect(response.status).to.eqls(201);
    });
});
