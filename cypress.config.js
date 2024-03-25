const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        chromeWebSecurity: false,
        specPattern: "cypress/specs/**/*.cy.{js,jsx,ts,tsx}",
        reporter: "cypress-mochawesome-reporter",
        testIsolation: true,
        setupNodeEvents(on, config) {
            require("cypress-mochawesome-reporter/plugin")(on);
        },
        baseUrl: "https://apichallenges.eviltester.com",
        env: {
            
        },
    },
});