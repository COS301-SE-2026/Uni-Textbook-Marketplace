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

}
