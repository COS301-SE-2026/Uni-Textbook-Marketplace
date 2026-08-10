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

        cy.contains('Invalid email').should('be.visible');
    });

    it('shows a client-side validation error for a short password', () => {

        cy.get('input[placeholder="you@university.ac.za"]').type(validEmail);

        cy.get('#password-desktop').type('short');

        cy.contains('button', 'Login').click();
        cy.contains('Password must be at least 8 characters').should('be.visible');
    });

    

    it('shows a server error for incorrect credentials', () => {


        cy.get('input[placeholder="you@university.ac.za"]').type(validEmail);
        cy.get('#password-desktop').type('WrongPassword123');

        cy.contains('button', 'Login').click();
        cy.get('body').should('contain.text', 'Invalid');
        
    });

    
    it('toggles password visibility', () => {
        const pwdInput = cy.get('#password-desktop');

        pwdInput.type(validPassword);

        pwdInput.should('have.attr', 'type', 'password');

        cy.get('button[aria-label="Show password"]').click();

        pwdInput.should('have.attr', 'type', 'text');

        cy.get('button[aria-label="Hide password"]').click();
        pwdInput.should('have.attr', 'type', 'password');
    });

    it('navigates to the forgot password page', () => {


        cy.contains('Forgot Password?').click();

        cy.url().should('include', '/auth/resetpassword');
    });
    
});