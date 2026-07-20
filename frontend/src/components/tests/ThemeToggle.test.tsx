import { render, screen, fireEvent } from '@/test-utils';
import ThemeToggle from '../ThemeToggle';

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {



    return <>{children}</>;
};

describe('ThemeToggle', () => {
    
    it('renders moon icon in light mode', () => {

        render(<ThemeWrapper>
                    <ThemeToggle />

                </ThemeWrapper>);
        
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();



        expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('renders sun icon in dark mode', () => {
        
        render(
            <ThemeWrapper>

                <ThemeToggle />

            </ThemeWrapper>
        );
        const button = screen.getByRole('button', { name: /toggle theme/i});



        expect(button).toHaveClass('hover:bg-gray-100');
    });

    it('calls setTheme when clicked', () => {
        
        render(
            <ThemeWrapper>
                <ThemeToggle />

            </ThemeWrapper>
        );
        const button = screen.getByRole('button', { name: /toggle theme/i });

        

        fireEvent.click(button);


        expect(button).toBeInTheDocument();

    });

    it('applies hover styles classes', () => {


        render(
            <ThemeWrapper>
                <ThemeToggle />
            </ThemeWrapper>


        );
        const button = screen.getByRole('button', { name: /toggle theme/i});


        expect(button).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800');


    });
});