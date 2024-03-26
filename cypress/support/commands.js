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

Cypress.Commands.add(
    'verifyThatTaskIsInsertedInDB',
    (id, title, doneStatus, description) => {
        cy.api({
            method: 'GET',
            url: `/todos/${id}`,
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.status).to.eqls(200);
            expect(response.body.todos[0].id).to.eqls(id);
            expect(response.body.todos[0].title).to.eqls(title);
            expect(response.body.todos[0].doneStatus).to.eqls(doneStatus);
            expect(response.body.todos[0].description).to.eqls(description);
        });
    }
);

Cypress.Commands.add('deleteAllTodos', () => {
    cy.api({
        method: 'GET',
        url: '/todos',
        headers: {
            'X-Challenger': Cypress.env('X-Challenger')
        }
    }).then((response) => {
        expect(response.status).to.eqls(200);
        const todos = response.body.todos;
        todos.forEach((todo) => {
            cy.api({
                method: 'DELETE',
                url: `/todos/${todo.id}`,
                headers: {
                    'X-Challenger': Cypress.env('X-Challenger')
                }
            });
        });
        cy.api({
            method: 'GET',
            url: '/todos',
            headers: {
                'X-Challenger': Cypress.env('X-Challenger')
            }
        }).then((response) => {
            expect(response.body.todos.length).to.eqls(0);
        });
    });
});
