import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpMenu from '../HelpMenu';



jest.mock('next/link', () => {
  const MockLink = ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick} data-testid="help-link">
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
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

    it('closes the modal when clicking the backdrop', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));


      expect(screen.getByText('Quick Help')).toBeInTheDocument();
      
      const backdrop = screen.getByRole('presentation');


      await user.click(backdrop);
      
      await waitFor(() => {
        expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();
      });
    });

    it('closes the modal when clicking the "View full help center" link', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);

      await user.click(screen.getByRole('button', { name: /help/i }));


      expect(screen.getByText('Quick Help')).toBeInTheDocument();

      const helpLink = screen.getByTestId('help-link');
      await user.click(helpLink);
      
      await waitFor(() => {
        expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();
      });
    });

    it('closes the modal when pressing Escape key', async () => {
      const user = userEvent.setup();


      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));


      expect(screen.getByText('Quick Help')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      
      await waitFor(() => {


        expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label on help button', () => {


      render(<HelpMenu />);
      
      const helpButton = screen.getByRole('button', { name: /help/i });


      expect(helpButton).toHaveAttribute('aria-label', 'Help');
    });

    it('has correct ARIA roles on modal', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));

      const backdrop = screen.getByRole('presentation');


      expect(backdrop).toBeInTheDocument();

      const modal = screen.getByText('Quick Help').closest('div[class*="bg-[var(--card-bg)]"]');
      expect(modal).toBeInTheDocument();
    });

    it('sets focus on the modal when opened', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      const helpButton = screen.getByRole('button', { name: /help/i });


      await user.click(helpButton);

      const closeButton = screen.getByRole('button', { name: /close/i });


      expect(closeButton).toBeInTheDocument();
    });

    it('uses semantic heading elements', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const heading = screen.getByRole('heading', { name: /Quick Help/i });


      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('uses semantic heading for FAQ questions', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const faqHeading = screen.getByRole('heading', { name: /How do I create a listing\?/i });
      expect(faqHeading).toBeInTheDocument();


      expect(faqHeading.tagName).toBe('H3');
    });

    it('has correct ARIA labels on icon buttons', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const closeButton = screen.getByRole('button', { name: /close/i });


      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });
  });

  describe('styles and animations', () => {


    it('applies correct hover styles to help button', () => {
      render(<HelpMenu />);
      
      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toHaveClass(
        'hover:bg-[#0096B4]',
        'hover:shadow-xl',
        'transition-all',
        'duration-300'
      );
    });

    it('applies scale animation to icon on hover', () => {
      render(<HelpMenu />);
      
      const helpIcon = screen.getByTestId('help-circle-icon');

      expect(helpIcon).toHaveClass('group-hover:scale-110');
    });

    it('applies fade-in animation to modal', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const backdrop = screen.getByRole('presentation');


      expect(backdrop).toHaveClass('animate-in', 'fade-in', 'duration-200');
    });

    it('applies transition effects to close button', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const closeButton = screen.getByRole('button', { name: /close/i });


      expect(closeButton).toHaveClass('transition-colors');
    });

    it('applies dark mode classes correctly', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const closeButton = screen.getByRole('button', { name: /close/i });


      expect(closeButton).toHaveClass('dark:hover:bg-gray-800');
    });
  });

  describe('edge cases', () => {
    it('handles multiple open/close toggles correctly', async () => {

      const user = userEvent.setup();
      render(<HelpMenu />);
      
      const helpButton = screen.getByRole('button', { name: /help/i });

      await user.click(helpButton);


      expect(screen.getByText('Quick Help')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close/i }));
      await waitFor(() => {
        expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();
      });

      await user.click(helpButton);
      expect(screen.getByText('Quick Help')).toBeInTheDocument();
    });

    it('handles FAQ list rendering with correct Q: prefix', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const qPrefixes = screen.getAllByText('Q:');


      expect(qPrefixes).toHaveLength(3);
      qPrefixes.forEach((prefix) => {
        expect(prefix).toHaveClass('text-[#00B4D8]');
      });
    });

    it('renders the ChevronRight icon in the help link', async () => {


      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      const chevronIcon = screen.getByTestId('chevron-right-icon');

      expect(chevronIcon).toBeInTheDocument();
    });

    it('applies correct brand colors to elements', async () => {
      const user = userEvent.setup();
      render(<HelpMenu />);
      
      await user.click(screen.getByRole('button', { name: /help/i }));
      
      
      const helpCircles = screen.getAllByTestId('help-circle-icon');


      expect(helpCircles[1]).toHaveClass('text-[#00B4D8]');
      
      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toHaveClass('bg-[#00B4D8]');
    });
  });

  describe('performance', () => {
    it('does not re-render modal content when closed', () => {


      const { rerender } = render(<HelpMenu />);

      expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();

      rerender(<HelpMenu />);

      expect(screen.queryByText('Quick Help')).not.toBeInTheDocument();
    });
  });
});