import { render, screen, fireEvent } from '@/test-utils';
import Button from '../Button';

describe('Button', () => {
    it('renders children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies secondary variant class', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-primary');
    });

    it('applies secondary variant class', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-primary');
    });

    it('applies secondary variant class', () => {
        render(<Button variant="secondary">Click me</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    });

    it('is disable when disabled prop is true', () => {
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