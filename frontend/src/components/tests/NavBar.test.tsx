import { render, screen } from '@/test-utils';
import NavBar from '../NavBar';

global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
};

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => ({ 
        push: jest.fn(),
        back: jest.fn(),
    })),
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

const mockUseAuth = require('@/context/AuthContext').useAuth;

describe('NavBar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders logo and Marketplace text', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            logout: jest.fn(),
        });
        const { container } = render(<NavBar />);
        expect(container).toHaveTextContent(/Uni Textbook/);
        expect(container).toHaveTextContent(/Marketplace/);
    });

    it('shows Register and Login buttons when not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            logout: jest.fn(),
        });
        const { container } =  render(<NavBar />);
        expect(container).toHaveTextContent(/Register/);
        expect(container).toHaveTextContent(/Login/);
    });

    it('shows user menu when authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: { first_name: 'John', last_name: 'Doe', role: 'student'},
            isAuthenticated: true,
            isLoading: false,
            logout: jest.fn(),
        });
        const { container } = render(<NavBar />);
        expect(container).toHaveTextContent(/John/);
        expect(container).toHaveTextContent(/BROWSE/);
        expect(container).toHaveTextContent(/SELL/);
        expect(container).not.toHaveTextContent(/MODERATE/);
    });

    it('shows admin nav links when user is admin', () => {
        mockUseAuth.mockReturnValue({
            user: { first_name: 'Admin', last_name: 'User', role: 'admin'},
            isAuthenticated: true,
            isLoading: false,
            logout: jest.fn(),
        });
        const { container } = render(<NavBar />);
        expect(container).toHaveTextContent(/MODERATE/);
        expect(container).not.toHaveTextContent(/Register/);
        expect(container).not.toHaveTextContent(/Login/);
    });
});