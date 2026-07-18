import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
//import { string } from 'zod';


Object.defineProperty(window, 'matchMedia', {


    writable: true,
    //@ts-ignore
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,

        media:query,
        onchange: null,

        //@ts-ignore
        addListener: jest.fn(),
        //@ts-ignore
        removeListener: jest.fn(),
        //@ts-ignore
        addEventListener: jest.fn(),
        //@ts-ignore
        removeEventListener: jest.fn(),
        //@ts-ignore
        dispatchEvent: jest.fn(),
    })),
});

//@ts-ignore
jest.mock('next-themes', () => ({

    //@ts-ignore
    useTheme: jest.fn(() => ({
        theme: 'light',

        //@ts-ignore
        setTheme: jest.fn(),
    })),
}));

//@ts-ignore
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

//@ts-ignore
jest.mock('next/navigation', () => ({

    //@ts-ignore
    usePathname: jest.fn(() => '/'),
    //@ts-ignore
    useRouter: jest.fn(() => ({

        //@ts-ignore
        push: jest.fn(),
        //@ts-ignore
        back: jest.fn(),
    })),
}));
//@ts-ignore
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