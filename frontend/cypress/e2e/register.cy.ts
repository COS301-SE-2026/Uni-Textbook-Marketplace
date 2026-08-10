describe('Registration', () => {

    const universityName = 'University of Pretoria';
    const emailDomain = 'tuks.co.za';

    beforeEach(() => {

        cy.visit('/auth/register');
    });

    it('walks through steps 1-3 and reaches the OTP verification screen', () => {
        const uniqueEmail = `cypress.test.${Date.now()}@${emailDomain}`;

        cy.get('input[placeholder="Enter your full name(s)"]').type('Cypress');
        cy.get('input[placeholder="Enter your surname"]').type('Tester');

        cy.contains('button', 'Next').click();

        cy.get('select[name="university"]').select(universityName);
        cy.get('input[placeholder="@university.email"]').type(uniqueEmail);
        cy.contains('button', 'Next').click();


        cy.get('#reg-password').type('CypressTest123');
        cy.get('#reg-confirm-password').type('CypressTest123');
        cy.get('#terms').check();

        cy.contains('button', 'Next').click();

        cy.contains('OTP Verification').should('be.visible');
        cy.contains('REGISTER').should('be.visible');

    });
})