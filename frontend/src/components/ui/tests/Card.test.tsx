import { render, screen } from '@/test-utils';
import Card from '../Card';

describe('Card', () => {
    it('renders children', () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default variant class', () => {
        render(<Card>Content</Card>);
        const card = screen.getByText('Content').parentElement;
        expect(card).toHaveClass('glass');
        expect(card).toHaveClass('backdrop-blur-md');
    });

    it('merges custom className', () => {
        render(<Card className="custom-class">Content</Card>);
        const card = screen.getByText('Content').parentElement;
        expect(card).toHaveClass('custom-class');
    });
});