import { render, screen, fireEvent } from '@/test-utils';
import Button from '../Button';

describe('Button', () => {
    it('renders children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies primary variant class (default)', () => {
        render(<Button>Click me</Button>);
        
        expect(screen.getByRole('button')).toHaveClass('bg-primary');
    });

    it('applies secondary variant class', () => {
        render(<Button variant="secondary">Click me</Button>);

        expect(screen.getByRole('button')).toHaveClass('bg-secondary');
    });

    it('applies destructive variant class', () => {
        render(<Button variant="destructive">Click me</Button>);


        expect(screen.getByRole('button')).toHaveClass('bg-destructive');
    });

    it('applies outline variant class', () => {
        render(<Button variant="outline">Click me</Button>);
        
        expect(screen.getByRole('button')).toHaveClass('border-primary/40');
    });

    it('applies ghost variant class', () => {

        render(<Button variant="ghost">Click me</Button>);
        
        expect(screen.getByRole('button')).toHaveClass('hover:bg-muted');
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Click me</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('calls onClick when clicked', () => {

        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button'));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {

        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('merges custom className', () => {
        render(<Button className="custom-class">Click me</Button>);
        
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
});