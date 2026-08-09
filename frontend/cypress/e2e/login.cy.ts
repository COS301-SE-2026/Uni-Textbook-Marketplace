describe('Login', () => {

    const validEmail = 'student@tuks.co.za';
    const validPassword = 'Password123';

    beforeEach(() => {
        cy.visit('/auth/login');
    });

    it('logs in an existing verified student and lands on the listings page', () => {
        cy.get('input[placeholder="you@university.ac.za"]').type(validEmail);
        cy.get('#password-desktop').type(validPassword);

        cy.contains('button', 'Login').click();

        cy.url().should('include', '/listings');
    });

    it('shows a client-side validation error for an invalid email format', () => {
        cy.get('input[placeholder="you@university.ac.za"]').type('not-an-email');
        cy.get('#password-desktop').type(validPassword);

        cy.contains('button', 'Login').click();

        cy.contains('Invalid email').should('be-visible');
    });

    
})