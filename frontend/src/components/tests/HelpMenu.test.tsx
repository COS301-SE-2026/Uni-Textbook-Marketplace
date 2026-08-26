import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpMenu from '../HelpMenu';
import Link from 'next/link';

jest.mock('next/link', () => {
  return ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick} data-testid="help-link">


      {children}
    </a>
  );
});

jest.mock('lucide-react', () => ({
  HelpCircle: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="help-circle-icon" className={className} width={size} height={size}>


      <title>Help Circle</title>
    </svg>
  ),
  X: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="x-icon" className={className} width={size} height={size}>

      <title>Close</title>
    </svg>
  ),
  ChevronRight: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="chevron-right-icon" className={className} width={size} height={size}>
      <title>Chevron Right</title>


    </svg>
  ),
}));


describe('HelpMenu', () => {

  describe('rendering', () => {

    it('renders the help button', () => {

      render(<HelpMenu />);
      
      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toBeInTheDocument();


      expect(helpButton).toHaveClass('fixed', 'bottom-6', 'right-6');
    });

    it('renders the HelpCircle icon on the button', () => {
      render(<HelpMenu />);
      
      const helpIcon = screen.getByTestId('help-circle-icon');
      expect(helpIcon).toBeInTheDocument();


    });

    it('does not render the modal by default', () => {
      render(<HelpMenu />);
      
      const modal = screen.queryByText(/Quick Help/i);
      
      expect(modal).not.toBeInTheDocument();
    });
  });


  describe('interaction - opening modal', () => {
    it('opens the modal when help button is clicked', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      const helpButton = screen.getByRole('button', { name: /help/i });

      await user.click(helpButton);
      
      const modalTitle = screen.getByText(/Quick Help/i);


      expect(modalTitle).toBeInTheDocument();
    });

    it('shows the modal with correct title', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      expect(screen.getByText('Quick Help')).toBeInTheDocument();


      expect(screen.getByText(/Here are answers to the most common questions/i)).toBeInTheDocument();
    });

    it('displays all FAQ items', async () => {



      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const faqs = [
        'How do I create a listing?',
        'How long does approval take?',


        'How do I contact a seller?'
      ];
      
      faqs.forEach((faq) => {
        expect(screen.getByText(faq)).toBeInTheDocument();
      });
    });

    it('displays FAQ answers correctly', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const answers = [
        'Go to the Sell page, fill in your book details, and submit. Your listing will be reviewed by Admin.',
        'Listings are reviewed within 24-48 hours. You will be notified when approved or rejected.',
        'Click on a listing and use the "Message Seller" button. Your contact details remain private.'
      ];
      
      answers.forEach((answer) => {
        expect(screen.getByText(answer)).toBeInTheDocument();

      });
    });

    it('shows the full help center link', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const helpLink = screen.getByTestId('help-link');
      expect(helpLink).toBeInTheDocument();


      expect(helpLink).toHaveAttribute('href', '/help');
      expect(helpLink).toHaveTextContent('View full help center');
    });

    it('renders the close button in the modal', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();


      expect(closeButton.querySelector('[data-testid="x-icon"]')).toBeInTheDocument();
    });
  });

  describe('interaction - closing modal', () => {

    it('closes the modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);

      await user.click(screen.getByRole('button', { name: /help/i }));

      expect(screen.getByText('Quick Help')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();
      });
    });

}
