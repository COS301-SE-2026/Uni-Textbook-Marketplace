import { render, screen } from '@/test-utils';
import Card from '../Card';

describe('Card', () => {
    it('renders children', () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default variant class', () => {
        render(<Card>Content</Card>);
        const card = screen.getByText('Content').closest('.card');
        expect(card).toHaveClass('card');
    });

    it('applies glass variant class', () => {
        render(<Card variant="glass">Content</Card>);
        const card = screen.getByText('Content').closest('.card');
        expect(card).toHaveClass('glass');
        expect(card).toHaveClass('backdrop-blur-md');
    })

    it('merges custom className', () => {
        render(<Card className="custom-class">Content</Card>);
        const card = screen.getByText('Content').closest('.card');
        expect(card).toHaveClass('custom-class');
    });
});