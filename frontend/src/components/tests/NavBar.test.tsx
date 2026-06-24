import { render, screen } from '@/test-utils';
import NavBar from '../NavBar';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('NavBar', () => {
    it('renders logo and Marketplace text', () => {
        (useAuth as jest.Mock).mockRejectedValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            logout: jest.fn(),
        });
        render(<NavBar />);
        expect(screen.getByText('Uni Textbook')).toBeInTheDocument();
        expect(screen.getByText('Marketplace')).toBeInTheDocument();
    });

    it('shows Register and Login buttons when not authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            logout:jest.fn(),
        });
        render(<NavBar />);
        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('shows user menu when authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { first_name: 'John', last_name: 'Doe', role: 'student'},
            isAuthenticated: true,
            isLoading: false,
            logout: jest.fn(),
        });
        render(<NavBar />);
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Browse')).toBeInTheDocument();
        expect(screen.getByText('Sell')).toBeInTheDocument();
    });

    it('shows admin nav links when user is admin', () => {
        (useAuth as jest.Mock).mockRejectedValue({
            user: { first_name: 'Admin', last_name: 'User', role: 'admin'},
            isAuthenticated: true,
            isLoading: false,
            logout: jest.fn(),
        });
        render(<NavBar />);
        expect(screen.getByText('Moderate')).toBeInTheDocument();
    });
});