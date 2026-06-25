import { render, screen, fireEvent } from '@/test-utils';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from 'next-themes';

jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
    const mockSetTheme = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        const { useTheme } = require('next-themes');
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });
    });

    it('renders moon icon in light mode', () => {
        render(<ThemeToggle />);
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('renders sun icon in dark mode', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });
        render(<ThemeToggle />);
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('calls setTheme with "dark" when clicked in light mode', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('calls setTheme with "light" when clicked in dark mode', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('applies hover styles classes', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i});
        expect(button).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800');
    });
});