import { render } from '@/test-utils';
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
const mockUsePathname = require('next/navigation').usePathname;

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

describe('transparent navbar', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
        window.dispatchEvent(new Event('scroll'));
        mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false, logout: jest.fn() });

    });

    const renderNav = (path: string, scroll: number) => {
        mockUsePathname.mockReturnValue(path);
        Object.defineProperty(window, 'scrollY', { value: scroll, writable: true});
        
        window.dispatchEvent(new Event('scroll'));
        return render(<NavBar />);
    };

    it('is transparent on landing page at hero section', () => {
        const { container } = renderNav('/', 0);
        expect(container.querySelector('nav')).toHaveClass('bg-transparent');
    });

    it('is opaque on landing page on scroll', () => {
        const { container } = renderNav('/', 100);
        expect(container.querySelector('nav')).toHaveClass('bg-[var(--nav-bg)]');
    });

    it('is opaque on non-landing pages', () => {
        const { container } = renderNav('/listings', 0);
        expect(container.querySelector('nav')).not.toHaveClass('bg-transparent');
    });

    it('shows white text on transparent navbar', () => {
        const { container } = renderNav('/', 0);
        expect(container.querySelector('.leading-tight span:last-child')).toHaveClass('text-white');

    });

    it('shows dark text on opaque navbar', () => {
        const { container } = renderNav('/', 100);
        expect(container.querySelector('.leading-tight span:last-child')).not.toHaveClass('text-white');
    });

});