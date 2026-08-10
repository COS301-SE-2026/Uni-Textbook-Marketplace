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

    it('blocks step 1 from advancing with empty requireed fields', () => {
        cy.contains('button', 'Next').click();

        cy.contains('Full name is required').should('be.visible');
        cy.contains('Surname is required').should('be.visible');


        cy.get('select[name=university]').should('not.exist');

    });


    it('blocks step 2 from advancing without a selected university', () => {
        cy.get('input[placeholder="Enter your full name(s)"]').type('Cypress');
        cy.get('input[placeholder="Enter your surname"]').type('Tester');

        cy.contains('button', 'Next').click();
        cy.contains('button', 'Next').click();
        cy.contains('Please select your university').should('be.visible');
    });


    it('blocks step 2 from advancing when the email does not match selected university domain', () => {
        cy.get('input[placeholder="Enter your full name(s)"]').type('Cypress');
        cy.get('input[placeholder="Enter your surname"]').type('Tester');


        cy.contains('button', 'Next').click();
        cy.get('select[name="university"]').select(universityName);
        cy.get('input[placeholder="@university.email"]').type('cypress.test@university.gmail.com');
        cy.contains('button', 'Next').click();
        cy.contains(`Email must end in @${emailDomain}`).should('be.visible');

    });


    it('blocks step 3 from advancing when the passwords do not match', () => {

    });
})