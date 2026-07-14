import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media:query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

jest.mock('next-themes', () => ({
    useTheme: jest.fn(() => ({
        theme: 'light',
        setTheme: jest.fn(),
    })),
}));

jest.mock('lucide-react', () => ({
    Moon: () => <svg data-testid="moon-icon" />,
    Sun: () => <svg data-testid="sun-icon" />,
    Menu: () => <svg data-testid="menu-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Bell: () => <svg data-testid="bell-icon" />,
    ChevronDown: () => <svg data-testid="chevron-down-icon" />,
    BookOpen: () => <svg data-testid="book-open-icon" />,
    Check: () => <svg data-testid="check-icon" />,
    Heart: () => <svg data-testid="heart-icon" />,
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        back: jest.fn(),
    })),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />;
    },
}));

const customRender = (ui: ReactElement, options?: RenderOptions) => 
    render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };